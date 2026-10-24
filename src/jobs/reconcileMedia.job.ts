import prisma from "../config/prisma.js";
import { logger } from "../logger/logger.logger.js";
import { notifyJobEnqueued } from "../workers/mediaWorker.js";

export interface ReconcileResult {
  rescuedStuckJobs: number;
  enqueuedMissingJobs: number;
  scannedTrashAssets: number;
  timestamp: Date;
}

/**
 * Self-healing reconciler job.
 * Scans for orphan states, missing outbox deletion jobs, and rescues stuck 'PROCESSING' jobs.
 */
export async function runMediaReconciler(): Promise<ReconcileResult> {
  const result: ReconcileResult = {
    rescuedStuckJobs: 0,
    enqueuedMissingJobs: 0,
    scannedTrashAssets: 0,
    timestamp: new Date(),
  };

  logger.info("[MediaReconciler] Running self-healing integrity scan...");

  try {
    const now = new Date();

    // 1. Rescue stuck jobs: Any job in 'PROCESSING' for more than 1 hour indicates an abnormal server shutdown
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

    const stuckJobs = await prisma.mediaDeletionJob.updateMany({
      where: {
        status: "PROCESSING",
        updatedAt: { lt: oneHourAgo },
      },
      data: {
        status: "PENDING",
        updatedAt: now,
        lastError: "Auto-rescued from stuck PROCESSING state by MediaReconciler",
      },
    });

    result.rescuedStuckJobs = stuckJobs.count;
    if (stuckJobs.count > 0) {
      logger.warn(
        `[MediaReconciler] Rescued ${stuckJobs.count} stuck PROCESSING job(s) back to PENDING.`
      );
    }

    // 2. Identify IN_TRASH assets missing an active MediaDeletionJob
    const trashedAssets = await prisma.mediaAsset.findMany({
      where: {
        status: "IN_TRASH",
        references: { none: {} },
      },
      select: {
        id: true,
        storagePath: true,
        deletedAt: true,
        createdAt: true,
      },
    });

    result.scannedTrashAssets = trashedAssets.length;

    for (const asset of trashedAssets) {
      const activeJob = await prisma.mediaDeletionJob.findFirst({
        where: {
          mediaId: asset.id,
          status: { in: ["PENDING", "PROCESSING"] },
        },
      });

      if (!activeJob) {
        // Compute proper scheduledFor date: 30 days after deletedAt, or immediately if already > 30 days
        const baseDate = asset.deletedAt || asset.createdAt || now;
        const targetDate = new Date(baseDate.getTime() + 30 * 24 * 60 * 60 * 1000);
        const scheduledFor = targetDate < now ? now : targetDate;

        await prisma.mediaDeletionJob.create({
          data: {
            mediaId: asset.id,
            filePath: asset.storagePath,
            scheduledFor,
            status: "PENDING",
          },
        });

        notifyJobEnqueued(scheduledFor);
        result.enqueuedMissingJobs++;

        logger.info(
          `[MediaReconciler] Enqueued missing deletion job for trashed asset '${asset.id}' (scheduled for: ${scheduledFor.toISOString()})`
        );
      }
    }

    logger.success(
      `[MediaReconciler] Integrity scan complete. Rescued: ${result.rescuedStuckJobs}, Missing jobs enqueued: ${result.enqueuedMissingJobs}, Trashed assets audited: ${result.scannedTrashAssets}`
    );
  } catch (err: any) {
    logger.error("[MediaReconciler] Integrity scan failed:", err?.message || err);
    throw err;
  }

  return result;
}
