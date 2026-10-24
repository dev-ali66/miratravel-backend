import fs from "fs";
import path from "path";
import prisma from "../config/prisma.js";
import { logger } from "../logger/logger.logger.js";
import { deleteFromLocalStorage, getUploadsDir } from "../shared/upload_local.service.js";

export interface CleanupCycleResult {
  processedCount: number;
  deletedCount: number;
  restoredCount: number;
  failedCount: number;
  freedBytes: number;
  nextRunAt: Date | null;
  errors: Array<{ jobId: string; error: string }>;
}

export interface WorkerStatus {
  isRunning: boolean;
  lastRunAt: Date | null;
  nextRunAt: Date | null;
  pendingJobsCount: number;
  processingJobsCount: number;
  failedJobsCount: number;
  lastResult: CleanupCycleResult | null;
}

const MAX_ATTEMPTS = 5;
const DEFAULT_IDLE_SLEEP_MS = 6 * 60 * 60 * 1000; // 6 hours idle check if no jobs scheduled
const MAX_TIMEOUT_MS = 24 * 60 * 60 * 1000; // Clamp setTimeout to 24h to avoid Node.js 32-bit int overflow

let workerTimer: NodeJS.Timeout | null = null;
let isWorkerRunning = false;
let isCycleExecuting = false;
let lastRunTimestamp: Date | null = null;
let nextScheduledTimestamp: Date | null = null;
let lastCycleResult: CleanupCycleResult | null = null;

/**
 * Calculates earliest pending job execution time and queue counts.
 */
export async function calculateNextDueTime(): Promise<{
  nextRunAt: Date | null;
  pendingCount: number;
  processingCount: number;
  failedCount: number;
}> {
  try {
    // 1. Reconcile with active trashed assets: find all assets currently in IN_TRASH
    const activeTrashedAssets = await prisma.mediaAsset.findMany({
      where: { status: "IN_TRASH", deletedAt: { not: null } },
      select: { id: true },
    });
    const activeTrashedIds = activeTrashedAssets.map((a) => a.id);

    // 2. If no assets are currently in trash, purge any obsolete pending deletion jobs
    if (activeTrashedIds.length === 0) {
      await prisma.mediaDeletionJob.deleteMany({
        where: { status: { in: ["PENDING", "PROCESSING"] } },
      });
      nextScheduledTimestamp = null;
      return {
        nextRunAt: null,
        pendingCount: 0,
        processingCount: 0,
        failedCount: 0,
      };
    }

    // 3. Purge any orphaned jobs pointing to assets that were deleted or restored
    await prisma.mediaDeletionJob.deleteMany({
      where: {
        status: "PENDING",
        mediaId: { notIn: activeTrashedIds },
      },
    });

    // 4. Find the NEXT EARLIEST due date among valid pending jobs for items currently in trash
    const [earliestJob, pendingCount, processingCount, failedCount] = await Promise.all([
      prisma.mediaDeletionJob.findFirst({
        where: {
          status: "PENDING",
          mediaId: { in: activeTrashedIds },
        },
        orderBy: { scheduledFor: "asc" },
        select: { scheduledFor: true },
      }),
      prisma.mediaDeletionJob.count({
        where: {
          status: "PENDING",
          mediaId: { in: activeTrashedIds },
        },
      }),
      prisma.mediaDeletionJob.count({ where: { status: "PROCESSING" } }),
      prisma.mediaDeletionJob.count({ where: { status: "FAILED" } }),
    ]);

    const nextDue = earliestJob ? earliestJob.scheduledFor : null;
    nextScheduledTimestamp = nextDue;

    return {
      nextRunAt: nextDue,
      pendingCount,
      processingCount,
      failedCount,
    };
  } catch (err: any) {
    logger.error("[MediaWorker] Error calculating next due time:", err?.message || err);
    return {
      nextRunAt: null,
      pendingCount: 0,
      processingCount: 0,
      failedCount: 0,
    };
  }
}

/**
 * Processes all expired deletion jobs (scheduledFor <= NOW) in safe batches.
 * Atomic locking via 'PROCESSING' status prevents duplicate execution across cluster processes.
 */
export async function processPendingMediaDeletionJobs(
  batchSize = 50
): Promise<CleanupCycleResult> {
  const result: CleanupCycleResult = {
    processedCount: 0,
    deletedCount: 0,
    restoredCount: 0,
    failedCount: 0,
    freedBytes: 0,
    nextRunAt: null,
    errors: [],
  };

  if (isCycleExecuting) {
    logger.warn("[MediaWorker] Cleanup cycle already executing, skipping concurrent run.");
    return result;
  }

  isCycleExecuting = true;
  lastRunTimestamp = new Date();

  try {
    const now = new Date();

    // 1. Fetch expired jobs
    const expiredJobs = await prisma.mediaDeletionJob.findMany({
      where: {
        status: "PENDING",
        scheduledFor: { lte: now },
      },
      orderBy: { scheduledFor: "asc" },
      take: batchSize,
    });

    for (const job of expiredJobs) {
      // 2. Atomic claim: transition PENDING -> PROCESSING
      const claimResult = await prisma.mediaDeletionJob.updateMany({
        where: { id: job.id, status: "PENDING" },
        data: { status: "PROCESSING", updatedAt: new Date() },
      });

      if (claimResult.count === 0) {
        // Already claimed by another worker instance
        continue;
      }

      result.processedCount++;

      try {
        // 3. Just-In-Time Reference Check: Was this asset re-referenced during the 30-day grace period?
        const activeRefCount = await prisma.mediaReference.count({
          where: { mediaId: job.mediaId },
        });

        if (activeRefCount > 0) {
          // Case A: Asset is in active use! Cancel deletion and auto-restore to ACTIVE.
          await prisma.$transaction([
            prisma.mediaDeletionJob.update({
              where: { id: job.id },
              data: { status: "COMPLETED", updatedAt: new Date() },
            }),
            prisma.mediaAsset.updateMany({
              where: { id: job.mediaId },
              data: { status: "ACTIVE", deletedAt: null },
            }),
            prisma.mediaAuditLog.create({
              data: {
                mediaId: job.mediaId,
                action: "RESTORE",
                performedBy: "OUTBOX_WORKER",
                details: {
                  jobId: job.id,
                  reason: "referenced_during_grace_period",
                  activeReferences: activeRefCount,
                },
              },
            }),
          ]);

          result.restoredCount++;
          logger.info(
            `[MediaWorker] Asset '${job.mediaId}' re-referenced in ${activeRefCount} places. Auto-restored to ACTIVE; deletion job cancelled.`
          );
          continue;
        }

        // Case B: 0 references confirmed. Safe to permanently delete from disk and database.
        const asset = await prisma.mediaAsset.findUnique({
          where: { id: job.mediaId },
        });

        // 4. Physical file unlinking
        let fileUnlinked = false;
        const targetPathOrUrl = asset?.url || job.filePath;

        // Try standard local storage unlinker
        fileUnlinked = await deleteFromLocalStorage(targetPathOrUrl);

        // Fallback: direct file path unlinking if deleteFromLocalStorage didn't match URL pattern
        if (!fileUnlinked && job.filePath) {
          try {
            const resolvedPath = path.isAbsolute(job.filePath)
              ? job.filePath
              : path.join(getUploadsDir(), path.basename(job.filePath));

            if (fs.existsSync(resolvedPath)) {
              await fs.promises.unlink(resolvedPath);
              fileUnlinked = true;
            } else {
              // File already absent from disk (ENOENT equivalent) - treat as cleaned
              fileUnlinked = true;
            }
          } catch (unlinkErr: any) {
            if (unlinkErr.code === "ENOENT") {
              fileUnlinked = true;
            } else {
              throw unlinkErr;
            }
          }
        }

        // 5. Update asset & job records
        const assetSize = asset?.size || 0;

        await prisma.$transaction([
          prisma.mediaAsset.updateMany({
            where: { id: job.mediaId },
            data: { status: "DELETED", deletedAt: new Date() },
          }),
          prisma.mediaDeletionJob.update({
            where: { id: job.id },
            data: { status: "COMPLETED", updatedAt: new Date() },
          }),
          prisma.mediaAuditLog.create({
            data: {
              mediaId: job.mediaId,
              action: "PERMANENT_DELETE",
              performedBy: "OUTBOX_WORKER",
              details: {
                jobId: job.id,
                freedBytes: assetSize,
                filePath: job.filePath,
                fileUnlinked,
              },
            },
          }),
        ]);

        result.deletedCount++;
        result.freedBytes += assetSize;

        logger.info(
          `[MediaWorker] Asset '${job.mediaId}' permanently deleted. Freed ${(
            assetSize /
            (1024 * 1024)
          ).toFixed(2)} MB.`
        );
      } catch (jobErr: any) {
        const errorMsg = jobErr?.message || String(jobErr);
        result.errors.push({ jobId: job.id, error: errorMsg });

        const nextAttempts = (job.attempts || 0) + 1;

        if (nextAttempts >= MAX_ATTEMPTS) {
          // Mark permanently FAILED after reaching maximum retry attempts
          await prisma.mediaDeletionJob.update({
            where: { id: job.id },
            data: {
              status: "FAILED",
              attempts: nextAttempts,
              lastError: errorMsg,
              updatedAt: new Date(),
            },
          });
          result.failedCount++;
          logger.error(
            `[MediaWorker] Job '${job.id}' failed permanently after ${MAX_ATTEMPTS} attempts: ${errorMsg}`
          );
        } else {
          // Reschedule for 15 minutes later with exponential backoff
          const retryDelayMinutes = Math.min(60, 15 * Math.pow(1.5, nextAttempts - 1));
          const retryTime = new Date(Date.now() + retryDelayMinutes * 60 * 1000);

          await prisma.mediaDeletionJob.update({
            where: { id: job.id },
            data: {
              status: "PENDING",
              attempts: nextAttempts,
              scheduledFor: retryTime,
              lastError: errorMsg,
              updatedAt: new Date(),
            },
          });
          logger.warn(
            `[MediaWorker] Job '${job.id}' encountered error. Rescheduled for attempt ${nextAttempts + 1} at ${retryTime.toISOString()}`
          );
        }
      }
    }

    // 6. Calculate upcoming schedule
    const nextDue = await calculateNextDueTime();
    result.nextRunAt = nextDue.nextRunAt;
    nextScheduledTimestamp = nextDue.nextRunAt;
  } finally {
    isCycleExecuting = false;
  }

  lastCycleResult = result;
  return result;
}

/**
 * Core dynamic wakeup loop.
 * Automatically sleeps until earliest pending job's scheduledFor date.
 */
async function scheduleNextRun() {
  if (!isWorkerRunning) return;

  if (workerTimer) {
    clearTimeout(workerTimer);
    workerTimer = null;
  }

  const { nextRunAt, pendingCount } = await calculateNextDueTime();
  nextScheduledTimestamp = nextRunAt;

  let delayMs = DEFAULT_IDLE_SLEEP_MS;

  if (nextRunAt) {
    const diff = nextRunAt.getTime() - Date.now();
    if (diff <= 0) {
      // Job is already due or overdue, run immediately
      delayMs = 1000;
    } else {
      // Sleep until target due time (clamped to max 24h for 32-bit integer safety)
      delayMs = Math.min(diff, MAX_TIMEOUT_MS);
    }
  }

  logger.info(
    `[MediaWorker] Next wakeup scheduled in ${(delayMs / 1000 / 60).toFixed(1)} mins (Target: ${
      nextRunAt ? nextRunAt.toISOString() : "None pending"
    }, Pending: ${pendingCount})`
  );

  workerTimer = setTimeout(async () => {
    try {
      await processPendingMediaDeletionJobs();
    } catch (cycleErr: any) {
      logger.error("[MediaWorker] Error during scheduled cleanup cycle:", cycleErr);
    } finally {
      if (isWorkerRunning) {
        scheduleNextRun();
      }
    }
  }, delayMs);

  workerTimer.unref();
}

/**
 * Starts the background Outbox Media Cleanup Worker with Smart Scheduled Wakeup.
 */
export async function startMediaCleanupWorker(): Promise<void> {
  if (isWorkerRunning) {
    logger.warn("[MediaWorker] Worker is already active.");
    return;
  }

  isWorkerRunning = true;
  logger.info("[MediaWorker] Starting Safe Cleanup Outbox Worker (Smart Scheduled Wakeup Engine)...");

  // Initial immediate processing of any existing overdue jobs on startup
  try {
    const initialResult = await processPendingMediaDeletionJobs();
    if (initialResult.processedCount > 0) {
      logger.info(
        `[MediaWorker] Startup sweep: ${initialResult.processedCount} jobs processed, ${initialResult.deletedCount} deleted, ${initialResult.restoredCount} restored.`
      );
    }
  } catch (err: any) {
    logger.error("[MediaWorker] Error during startup cleanup sweep:", err?.message || err);
  }

  // Schedule the smart next wakeup
  await scheduleNextRun();
  logger.success("[MediaWorker] Worker initialized and sleeping until next due date.");
}

/**
 * Gracefully stops the Outbox Media Cleanup Worker.
 */
export async function stopMediaCleanupWorker(): Promise<void> {
  isWorkerRunning = false;

  if (workerTimer) {
    clearTimeout(workerTimer);
    workerTimer = null;
  }

  // Wait for any active execution cycle to finish cleanly
  let waitCount = 0;
  while (isCycleExecuting && waitCount < 30) {
    await new Promise((r) => setTimeout(r, 100));
    waitCount++;
  }

  logger.info("[MediaWorker] Cleanup worker stopped gracefully.");
}

/**
 * Notifies the worker that a new job was enqueued.
 * If the new job is scheduled earlier than current nextScheduledTimestamp,
 * the worker wakes up sooner.
 */
export function notifyJobEnqueued(scheduledFor: Date): void {
  if (!isWorkerRunning) return;

  if (
    !nextScheduledTimestamp ||
    scheduledFor.getTime() < nextScheduledTimestamp.getTime()
  ) {
    logger.info(
      `[MediaWorker] Earlier job enqueued for ${scheduledFor.toISOString()}. Recalculating next wakeup...`
    );
    scheduleNextRun();
  }
}

/**
 * Notifies the worker that a job was removed or an asset was restored/purged.
 * Recalculates next wakeup time and adjusts sleeping timer immediately.
 */
export async function notifyJobRemoved(): Promise<void> {
  if (!isWorkerRunning) return;
  logger.info("[MediaWorker] Job removed or asset cleared from trash. Recalculating next wakeup...");
  await scheduleNextRun();
}

/**
 * Returns current health and queue metrics of the worker.
 */
export async function getMediaWorkerStatus(): Promise<WorkerStatus> {
  const { pendingCount, processingCount, failedCount, nextRunAt } =
    await calculateNextDueTime();

  return {
    isRunning: isWorkerRunning,
    lastRunAt: lastRunTimestamp,
    nextRunAt: pendingCount > 0 ? (nextRunAt || nextScheduledTimestamp) : null,
    pendingJobsCount: pendingCount,
    processingJobsCount: processingCount,
    failedJobsCount: failedCount,
    lastResult: lastCycleResult,
  };
}

