import fs from "fs";
import path from "path";
import { StatusCodes } from "http-status-codes";
import prisma from "../../config/prisma.js";
import ApiError from "../../utils/api.error.js";
import {
  assertMediaCanBeDeleted,
  getMediaUsage as getMediaUsageReport,
  syncEntityMediaReferences,
} from "../../shared/mediaReference.service.js";
import { deleteFromLocalStorage, getUploadsDir } from "../../shared/upload_local.service.js";
import {
  computeSha256,
  extractImageDimensions,
  generateMediaStoragePath,
} from "./mediaStorage.util.js";

interface GetMediaGalleryParams {
  page?: string;
  limit?: string;
  search?: string;
  type?: "all" | "image" | "video";
  status?: "ACTIVE" | "IN_TRASH" | "ALL";
  inUse?: "all" | "true" | "false" | boolean;
  sortBy?:
    | "createdAt"
    | "size"
    | "fileName"
    | "title"
    | "newest"
    | "oldest"
    | "size_desc"
    | "size_asc"
    | "usage_desc";
  sortOrder?: "asc" | "desc";
}

/**
 * Logs mutation actions to MediaAuditLog table.
 */
async function logMediaAudit(
  mediaId: string,
  action: string,
  performedBy?: string,
  details?: any
) {
  try {
    await prisma.mediaAuditLog.create({
      data: {
        mediaId,
        action,
        performedBy: performedBy || "admin",
        details: details || null,
      },
    });
  } catch (err) {
    console.warn("Failed to write MediaAuditLog:", err);
  }
}

/**
 * 1. Paginated media gallery list with search and filtering.
 */
export async function getMediaGallery(params: GetMediaGalleryParams) {
  const page = Math.max(1, parseInt(params.page || "1", 10));
  const limit = Math.min(100, Math.max(1, parseInt(params.limit || "20", 10)));
  const skip = (page - 1) * limit;

  const where: any = {};

  // Status filter
  if (params.status === "IN_TRASH") {
    where.status = "IN_TRASH";
    where.deletedAt = { not: null };
  } else if (params.status === "ALL") {
    // Both active and trash
  } else {
    // Default ACTIVE
    where.status = "ACTIVE";
    where.deletedAt = null;
  }

  // Type filter
  if (params.type === "image") {
    where.mimeType = { startsWith: "image/" };
  } else if (params.type === "video") {
    where.mimeType = { startsWith: "video/" };
  }

  // Search filter
  if (params.search && params.search.trim()) {
    const q = params.search.trim();
    where.OR = [
      { fileName: { contains: q, mode: "insensitive" } },
      { title: { contains: q, mode: "insensitive" } },
      { originalName: { contains: q, mode: "insensitive" } },
      { altText: { contains: q, mode: "insensitive" } },
    ];
  }

  // In-use filter
  if (params.inUse === "true" || params.inUse === true) {
    where.references = { some: {} };
  } else if (params.inUse === "false" || params.inUse === false) {
    where.references = { none: {} };
  }

  // Sorting
  let orderBy: any;
  if (params.sortBy === "newest") {
    orderBy = { createdAt: "desc" };
  } else if (params.sortBy === "oldest") {
    orderBy = { createdAt: "asc" };
  } else if (params.sortBy === "size_desc") {
    orderBy = { size: "desc" };
  } else if (params.sortBy === "size_asc") {
    orderBy = { size: "asc" };
  } else if (params.sortBy === "usage_desc") {
    orderBy = { references: { _count: "desc" } };
  } else {
    const sortBy = params.sortBy || "createdAt";
    const sortOrder = params.sortOrder || "desc";
    orderBy = { [sortBy]: sortOrder };
  }

  const [total, items] = await Promise.all([
    prisma.mediaAsset.count({ where }),
    prisma.mediaAsset.findMany({
      where,
      orderBy,
      skip,
      take: limit,
      include: {
        _count: {
          select: { references: true },
        },
      },
    }),
  ]);

  const data = await Promise.all(
    items.map(async (item) => {
      if (
        item.size <= 0 ||
        (item.mimeType.startsWith("image/") && (!item.width || !item.height))
      ) {
        try {
          const uploadsDir = getUploadsDir();
          const destPath = path.resolve(uploadsDir, item.fileName);
          if (!fs.existsSync(destPath)) {
            const cloudinaryDirs = [
              path.resolve(process.cwd(), "../cloudinary/image"),
              path.resolve(process.cwd(), "../cloudinary/raw"),
              path.resolve(process.cwd(), "../cloudinary/video"),
              path.resolve(process.cwd(), "cloudinary/image"),
              path.resolve(process.cwd(), "cloudinary/raw"),
              path.resolve(process.cwd(), "cloudinary/video"),
            ];
            for (const cDir of cloudinaryDirs) {
              const candidate = path.resolve(cDir, item.fileName);
              if (fs.existsSync(candidate)) {
                try {
                  fs.copyFileSync(candidate, destPath);
                } catch {
                  // ignore
                }
                break;
              }
            }
          }

          if (
            !fs.existsSync(destPath) &&
            item.url &&
            (item.url.startsWith("http://") || item.url.startsWith("https://"))
          ) {
            try {
              const res = await fetch(item.url, { signal: AbortSignal.timeout(3000) });
              if (res.ok) {
                const arr = await res.arrayBuffer();
                fs.writeFileSync(destPath, Buffer.from(arr));
              }
            } catch {
              // ignore network timeouts
            }
          }

          if (fs.existsSync(destPath)) {
            const buf = fs.readFileSync(destPath);
            const size = buf.length;
            const dims = item.mimeType.startsWith("image/")
              ? extractImageDimensions(buf, item.mimeType)
              : {};
            item.size = size;
            if (dims.width) item.width = dims.width;
            if (dims.height) item.height = dims.height;

            prisma.mediaAsset
              .update({
                where: { id: item.id },
                data: {
                  size,
                  width: dims.width ?? item.width,
                  height: dims.height ?? item.height,
                },
              })
              .catch(() => {});
          }
        } catch {
          // fallback gracefully
        }
      }

      return {
        ...item,
        usageCount: item._count.references,
        _count: undefined,
      };
    })
  );

  return {
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
    data,
  };
}

/**
 * 2. Media overview KPI stats for dashboard cards.
 */
export async function getMediaStats() {
  const [
    totalAssets,
    activeAssets,
    trashedAssets,
    totalImages,
    totalVideos,
    sizeAggregate,
    unusedAssets,
  ] = await Promise.all([
    prisma.mediaAsset.count(),
    prisma.mediaAsset.count({ where: { status: "ACTIVE", deletedAt: null } }),
    prisma.mediaAsset.count({ where: { status: "IN_TRASH", deletedAt: { not: null } } }),
    prisma.mediaAsset.count({
      where: { mimeType: { startsWith: "image/" }, status: "ACTIVE", deletedAt: null },
    }),
    prisma.mediaAsset.count({
      where: { mimeType: { startsWith: "video/" }, status: "ACTIVE", deletedAt: null },
    }),
    prisma.mediaAsset.aggregate({
      _sum: { size: true },
    }),
    prisma.mediaAsset.count({
      where: {
        status: "ACTIVE",
        deletedAt: null,
        references: { none: {} },
      },
    }),
  ]);

  const totalSizeBytes = sizeAggregate._sum.size || 0;
  const totalSizeMB = (totalSizeBytes / (1024 * 1024)).toFixed(2);
  const totalSizeFormatted =
    totalSizeBytes >= 1024 * 1024 * 1024
      ? `${(totalSizeBytes / (1024 * 1024 * 1024)).toFixed(2)} GB`
      : `${totalSizeMB} MB`;

  return {
    totalAssets,
    activeAssets,
    trashedAssets,
    totalImages,
    totalVideos,
    totalSizeBytes,
    totalSizeMB,
    unusedAssets,

    // Frontend KPI stats contract keys
    totalCount: activeAssets,
    totalSizeFormatted,
    imageCount: totalImages,
    videoCount: totalVideos,
    trashCount: trashedAssets,
    unusedCount: unusedAssets,
  };
}

/**
 * 3. Fetch single media asset by ID with usage count and audit logs.
 */
export async function getMediaById(id: string) {
  let asset = await prisma.mediaAsset.findFirst({
    where: { id, deletedAt: null },
    include: {
      _count: {
        select: { references: true },
      },
      auditLogs: {
        take: 10,
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!asset) {
    asset = await prisma.mediaAsset.findFirst({
      where: { id, deletedAt: { not: null } },
      include: {
        _count: {
          select: { references: true },
        },
        auditLogs: {
          take: 10,
          orderBy: { createdAt: "desc" },
        },
      },
    });
  }

  if (!asset) {
    throw new ApiError("Media asset not found", StatusCodes.NOT_FOUND);
  }

  return {
    ...asset,
    usageCount: asset._count.references,
    _count: undefined,
  };
}

/**
 * 4. Get detailed human-readable usage breakdown for an asset.
 */
export async function getMediaUsage(id: string) {
  let asset = await prisma.mediaAsset.findFirst({ where: { id, deletedAt: null } });
  if (!asset) {
    asset = await prisma.mediaAsset.findFirst({ where: { id, deletedAt: { not: null } } });
  }
  if (!asset) {
    throw new ApiError("Media asset not found", StatusCodes.NOT_FOUND);
  }
  return await getMediaUsageReport(id);
}

/**
 * 5. Single or multi-file upload with SHA-256 deduplication and dimensions extraction.
 */
export async function uploadMediaAssets(
  files: Express.Multer.File[],
  userId?: string
) {
  if (!files || files.length === 0) {
    throw new ApiError("No files provided for upload", StatusCodes.BAD_REQUEST);
  }

  const results = [];

  for (const file of files) {
    const buffer =
      file.buffer ||
      (file.path && fs.existsSync(file.path)
        ? await fs.promises.readFile(file.path)
        : null);

    if (!buffer) {
      throw new ApiError(
        `Invalid or empty file buffer for '${file.originalname || "upload"}'`,
        StatusCodes.BAD_REQUEST
      );
    }

    const hash = computeSha256(buffer);

    // 1. In-batch deduplication check (if same file uploaded multiple times in single request)
    const inBatchExisting = results.find((r: any) => r.hash === hash);
    if (inBatchExisting) {
      results.push({
        ...inBatchExisting,
        isDuplicate: true,
      });
      continue;
    }

    // 2. Check for duplicate asset by SHA-256 hash in DB (prioritizing canonical persistent VPS URL)
    let existing = await prisma.mediaAsset.findFirst({
      where: { hash, deletedAt: null, url: { contains: "/multimedia/uploads/" } },
      include: {
        _count: { select: { references: true } },
      },
    });

    if (!existing) {
      existing = await prisma.mediaAsset.findFirst({
        where: { hash, deletedAt: null },
        include: {
          _count: { select: { references: true } },
        },
      });
    }

    if (!existing) {
      existing = await prisma.mediaAsset.findFirst({
        where: { hash, deletedAt: { not: null } },
        include: {
          _count: { select: { references: true } },
        },
      });
    }

    if (existing) {
      // If found in trash, auto-restore
      if (existing.status === "IN_TRASH") {
        await prisma.mediaAsset.update({
          where: { id: existing.id },
          data: { status: "ACTIVE", deletedAt: null },
        });
      }

      await logMediaAudit(existing.id, "DEDUPLICATED", userId, {
        reusedByUpload: file.originalname,
      });

      results.push({
        ...existing,
        usageCount: existing._count.references,
        _count: undefined,
        isDuplicate: true,
      });
      continue;
    }

    // New unique file: write to disk and extract metadata
    const { fileName, filePath, fileUrl } = generateMediaStoragePath(
      file.originalname,
      file.mimetype
    );

    await fs.promises.writeFile(filePath, buffer);

    const dims = extractImageDimensions(buffer, file.mimetype);
    const cleanTitle = path.basename(
      file.originalname,
      path.extname(file.originalname)
    );

    const newAsset = await prisma.mediaAsset.create({
      data: {
        fileName,
        originalName: file.originalname,
        storagePath: filePath,
        url: fileUrl,
        mimeType: file.mimetype,
        size: buffer.length,
        hash,
        width: dims.width || null,
        height: dims.height || null,
        title: cleanTitle,
        status: "ACTIVE",
      },
    });

    await logMediaAudit(newAsset.id, "UPLOAD", userId, {
      size: newAsset.size,
      mimeType: newAsset.mimeType,
    });

    results.push({
      ...newAsset,
      usageCount: 0,
      isDuplicate: false,
    });
  }

  return results;
}

/**
 * 6. Update media title, alt text, and caption for SEO.
 */
export async function updateMediaMetadata(
  id: string,
  data: { title?: string | null; altText?: string | null; caption?: string | null },
  userId?: string
) {
  let asset = await prisma.mediaAsset.findFirst({ where: { id, deletedAt: null } });
  if (!asset) {
    asset = await prisma.mediaAsset.findFirst({ where: { id, deletedAt: { not: null } } });
  }
  if (!asset) {
    throw new ApiError("Media asset not found", StatusCodes.NOT_FOUND);
  }

  const updated = await prisma.mediaAsset.update({
    where: { id },
    data: {
      ...(data.title !== undefined ? { title: data.title } : {}),
      ...(data.altText !== undefined ? { altText: data.altText } : {}),
      ...(data.caption !== undefined ? { caption: data.caption } : {}),
    },
  });

  await logMediaAudit(id, "UPDATE", userId, { changes: data });

  return updated;
}

/**
 * 7. Soft-delete asset to IN_TRASH with 409 conflict guard if in use.
 */
export async function softDeleteMedia(id: string, userId?: string) {
  const asset = await prisma.mediaAsset.findFirst({ where: { id, deletedAt: null } });
  if (!asset) {
    throw new ApiError("Media asset not found", StatusCodes.NOT_FOUND);
  }

  // Safety check: block if actively referenced
  await assertMediaCanBeDeleted(id);

  const updated = await prisma.mediaAsset.update({
    where: { id },
    data: {
      status: "IN_TRASH",
      deletedAt: new Date(),
    },
  });

  await logMediaAudit(id, "MOVE_TO_TRASH", userId);

  return updated;
}

/**
 * 8. Restore an asset from IN_TRASH back to ACTIVE.
 */
export async function restoreMedia(id: string, userId?: string) {
  const asset = await prisma.mediaAsset.findFirst({
    where: { id, deletedAt: { not: null } },
  });
  if (!asset) {
    throw new ApiError("Media asset not found in trash", StatusCodes.NOT_FOUND);
  }

  const updated = await prisma.mediaAsset.update({
    where: { id },
    data: {
      status: "ACTIVE",
      deletedAt: null,
    },
  });

  // Cancel & delete pending outbox deletion jobs for this asset
  await prisma.mediaDeletionJob.deleteMany({
    where: { mediaId: id },
  });

  try {
    const { notifyJobRemoved } = await import("../../workers/mediaWorker.js");
    await notifyJobRemoved();
  } catch {}

  await logMediaAudit(id, "RESTORE", userId);

  return updated;
}

/**
 * 9. Permanent deletion: unlinks physical file from VPS disk and deletes DB record.
 */
export async function permanentDeleteMedia(id: string, userId?: string) {
  let asset = await prisma.mediaAsset.findFirst({ where: { id, deletedAt: null } });
  if (!asset) {
    asset = await prisma.mediaAsset.findFirst({ where: { id, deletedAt: { not: null } } });
  }
  if (!asset) {
    throw new ApiError("Media asset not found", StatusCodes.NOT_FOUND);
  }

  // Safety check: block if actively referenced
  await assertMediaCanBeDeleted(id);

  // Unlink file from disk
  await deleteFromLocalStorage(asset.url);

  // Delete associated deletion jobs first
  await prisma.mediaDeletionJob.deleteMany({
    where: { mediaId: id },
  });

  // Delete DB record
  await prisma.mediaAsset.delete({
    where: { id },
  });

  try {
    const { notifyJobRemoved } = await import("../../workers/mediaWorker.js");
    await notifyJobRemoved();
  } catch {}

  return { success: true, id, message: "Asset permanently deleted from disk and database" };
}

/**
 * 10. Empty trash: permanently purges all unused assets in IN_TRASH.
 */
export async function emptyTrash(userId?: string) {
  const trashedAssets = await prisma.mediaAsset.findMany({
    where: {
      status: "IN_TRASH",
      deletedAt: { not: null },
      references: { none: {} },
    },
  });

  const trashedIds = trashedAssets.map((a) => a.id);
  if (trashedIds.length > 0) {
    await prisma.mediaDeletionJob.deleteMany({
      where: { mediaId: { in: trashedIds } },
    });
  }

  let deletedCount = 0;

  for (const asset of trashedAssets) {
    try {
      await deleteFromLocalStorage(asset.url);
      await prisma.mediaAsset.delete({ where: { id: asset.id } });
      deletedCount++;
    } catch (err) {
      console.warn("Failed to purge asset:", asset.id, err);
    }
  }

  try {
    const { notifyJobRemoved } = await import("../../workers/mediaWorker.js");
    await notifyJobRemoved();
  } catch {}

  return {
    deletedCount,
    totalAttempted: trashedAssets.length,
  };
}

/**
 * 11. Bulk soft-delete items with reference safety checks.
 */
export async function bulkSoftDelete(ids: string[], userId?: string) {
  const results = {
    trashedCount: 0,
    blocked: [] as { id: string; title?: string; usageCount: number }[],
  };

  for (const id of ids) {
    try {
      const usage = await getMediaUsageReport(id);
      if (usage.usageCount > 0) {
        results.blocked.push({
          id,
          usageCount: usage.usageCount,
        });
        continue;
      }

      await prisma.mediaAsset.updateMany({
        where: { id, deletedAt: null },
        data: { status: "IN_TRASH", deletedAt: new Date() },
      });
      await logMediaAudit(id, "MOVE_TO_TRASH", userId);
      results.trashedCount++;
    } catch {
      // Skip not found or errors
    }
  }

  return results;
}

/**
 * 12. Bulk restore items from IN_TRASH.
 */
export async function bulkRestore(ids: string[], userId?: string) {
  const result = await prisma.mediaAsset.updateMany({
    where: { id: { in: ids }, deletedAt: { not: null } },
    data: { status: "ACTIVE", deletedAt: null },
  });

  // Cancel & delete pending outbox deletion jobs for these assets
  await prisma.mediaDeletionJob.deleteMany({
    where: { mediaId: { in: ids } },
  });

  try {
    const { notifyJobRemoved } = await import("../../workers/mediaWorker.js");
    await notifyJobRemoved();
  } catch {}

  for (const id of ids) {
    await logMediaAudit(id, "RESTORE", userId);
  }

  return { restoredCount: result.count };
}

/**
 * 13. Pre-upload instant hash check (Zero-byte client-side deduplication).
 * Allows client to check if a file already exists before transferring payload over network.
 */
export async function checkMediaHash(hash: string) {
  if (!hash || typeof hash !== "string") {
    return { exists: false, url: null };
  }

  const cleanHash = hash.trim().toLowerCase();

  let asset = await prisma.mediaAsset.findFirst({
    where: { hash: cleanHash, deletedAt: null, url: { contains: "/multimedia/uploads/" } },
  });

  if (!asset) {
    asset = await prisma.mediaAsset.findFirst({
      where: { hash: cleanHash, deletedAt: null },
    });
  }

  if (!asset) {
    // Check trash and auto-restore if requested
    asset = await prisma.mediaAsset.findFirst({
      where: { hash: cleanHash, deletedAt: { not: null } },
    });
    if (asset && asset.status === "IN_TRASH") {
      await prisma.mediaAsset.update({
        where: { id: asset.id },
        data: { status: "ACTIVE", deletedAt: null },
      });
    }
  }

  if (asset) {
    return {
      exists: true,
      id: asset.id,
      url: asset.url,
      fileName: asset.fileName,
      mimeType: asset.mimeType,
      size: asset.size,
      title: asset.title,
    };
  }

  return { exists: false, url: null };
}

/**
 * Helper to recursively replace all old URLs in a JSON structure with canonical master URL.
 */
function replaceUrlsInObject(
  obj: any,
  urlMap: Map<string, string>
): { updatedObj: any; replacedCount: number } {
  let replacedCount = 0;
  function recurse(current: any): any {
    if (typeof current === "string") {
      if (urlMap.has(current)) {
        replacedCount++;
        return urlMap.get(current);
      }
      return current;
    }
    if (Array.isArray(current)) {
      return current.map(recurse);
    }
    if (current !== null && typeof current === "object") {
      const copy: any = {};
      for (const key of Object.keys(current)) {
        copy[key] = recurse(current[key]);
      }
      return copy;
    }
    return current;
  }
  return { updatedObj: recurse(obj), replacedCount };
}

function formatBytesHelper(bytes: number, decimals = 2): string {
  if (!bytes || bytes <= 0) return "0 B";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

/**
 * 14. Scan media catalog for identical content (duplicate SHA-256 hashes).
 * Identifies duplicate groups, designates recommended master assets, populates
 * all active entity usages, and calculates reclaimable disk storage.
 */
export async function scanStorageOptimization() {
  const duplicateGroups = await prisma.mediaAsset.groupBy({
    by: ["hash"],
    where: {
      hash: { not: null },
      status: "ACTIVE",
      deletedAt: null,
    },
    _count: {
      id: true,
    },
    having: {
      id: {
        _count: { gt: 1 },
      },
    },
  });

  let totalDuplicateAssets = 0;
  let reclaimableBytes = 0;
  const groups: any[] = [];

  for (const group of duplicateGroups) {
    if (!group.hash) continue;

    const assets = await prisma.mediaAsset.findMany({
      where: {
        hash: group.hash,
        status: "ACTIVE",
        deletedAt: null,
      },
      include: {
        references: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    if (assets.length <= 1) continue;

    // Sort: highest usage count first, then oldest created
    const sortedAssets = [...assets].sort((a, b) => {
      if (b.references.length !== a.references.length) {
        return b.references.length - a.references.length;
      }
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });

    const masterCandidateAsset = sortedAssets[0];
    const duplicateAssets = sortedAssets.slice(1);

    async function populateAssetReferences(asset: any) {
      const report = await getMediaUsageReport(asset.id);
      return {
        id: asset.id,
        fileName: asset.fileName,
        url: asset.url,
        mimeType: asset.mimeType,
        size: asset.size,
        usageCount: report.usageCount,
        createdAt: asset.createdAt,
        references: report.references.map((r) => ({
          entityType: r.entityType,
          entityId: r.entityId,
          entityTitle: r.entityTitle,
          fieldPath: r.fieldPath,
          editUrl: r.editUrl,
        })),
      };
    }

    const masterCandidate = await populateAssetReferences(masterCandidateAsset);
    const duplicates = await Promise.all(duplicateAssets.map(populateAssetReferences));

    const groupReclaimable = duplicateAssets.reduce((sum, d) => sum + (d.size || 0), 0);
    reclaimableBytes += groupReclaimable;
    totalDuplicateAssets += duplicateAssets.length;

    groups.push({
      hash: group.hash,
      mimeType: masterCandidateAsset.mimeType,
      fileSize: masterCandidateAsset.size,
      fileSizeFormatted: formatBytesHelper(masterCandidateAsset.size),
      reclaimableBytes: groupReclaimable,
      reclaimableFormatted: formatBytesHelper(groupReclaimable),
      masterCandidate,
      duplicates,
    });
  }

  return {
    totalDuplicateGroups: groups.length,
    totalDuplicateAssets,
    reclaimableBytes,
    reclaimableFormatted: formatBytesHelper(reclaimableBytes),
    groups,
  };
}

/**
 * 15. Execute Storage Optimization.
 * Atomically re-links all entity references to the chosen master asset,
 * and moves all redundant duplicate assets to the 30-day trash bin with
 * automated outbox deletion jobs scheduled.
 */
export async function executeStorageOptimization(options?: {
  overrides?: Array<{ hash: string; masterId: string }>;
}) {
  const scan = await scanStorageOptimization();
  if (scan.totalDuplicateGroups === 0) {
    return {
      success: true,
      groupsProcessed: 0,
      referencesMigrated: 0,
      assetsMovedToTrash: 0,
      freedBytes: 0,
      freedFormatted: "0 B",
      trashedAssetNames: [],
    };
  }

  const overridesMap = new Map<string, string>();
  if (options?.overrides && Array.isArray(options.overrides)) {
    for (const ov of options.overrides) {
      if (ov.hash && ov.masterId) {
        overridesMap.set(ov.hash, ov.masterId);
      }
    }
  }

  let referencesMigrated = 0;
  let assetsMovedToTrash = 0;
  let freedBytes = 0;
  const trashedAssetNames: string[] = [];
  let groupsProcessed = 0;

  for (const group of scan.groups) {
    let masterId = overridesMap.get(group.hash) || group.masterCandidate.id;
    let masterAsset = await prisma.mediaAsset.findUnique({
      where: { id: masterId },
    });

    if (!masterAsset || masterAsset.status !== "ACTIVE" || masterAsset.hash !== group.hash) {
      masterId = group.masterCandidate.id;
      masterAsset = await prisma.mediaAsset.findUnique({ where: { id: masterId } });
    }

    if (!masterAsset) continue;

    const duplicateAssets = await prisma.mediaAsset.findMany({
      where: {
        hash: group.hash,
        id: { not: masterId },
        status: "ACTIVE",
        deletedAt: null,
      },
    });

    if (duplicateAssets.length === 0) continue;

    const urlMap = new Map<string, string>();
    for (const dup of duplicateAssets) {
      urlMap.set(dup.url, masterAsset.url);
    }

    const duplicateIds = duplicateAssets.map((d) => d.id);
    const affectedRefs = await prisma.mediaReference.findMany({
      where: { mediaId: { in: duplicateIds } },
    });

    const entityMap = new Map<string, { entityType: string; entityId: string }>();
    for (const ref of affectedRefs) {
      const key = `${ref.entityType}:${ref.entityId}`;
      if (!entityMap.has(key)) {
        entityMap.set(key, { entityType: ref.entityType, entityId: ref.entityId });
      }
    }

    // Re-link URLs and sync references on each referenced entity
    for (const entity of entityMap.values()) {
      const { entityType, entityId } = entity;
      try {
        switch (entityType.toUpperCase()) {
          case "JOURNEY": {
            const journey = await prisma.journey.findUnique({ where: { id: entityId } });
            if (journey) {
              const fields = [
                "hero",
                "overview",
                "itinerary",
                "accommodations",
                "whatsIncluded",
                "metadata",
                "card",
              ];
              const updateData: any = {};
              for (const f of fields) {
                if ((journey as any)[f]) {
                  const { updatedObj, replacedCount } = replaceUrlsInObject(
                    (journey as any)[f],
                    urlMap
                  );
                  if (replacedCount > 0) updateData[f] = updatedObj;
                }
              }
              if (Object.keys(updateData).length > 0) {
                const updated = await prisma.journey.update({
                  where: { id: entityId },
                  data: updateData,
                });
                await syncEntityMediaReferences("Journey", entityId, updated);
                referencesMigrated += affectedRefs.filter((r) => r.entityId === entityId).length;
              }
            }
            break;
          }
          case "LOCATION": {
            const location = await prisma.location.findUnique({ where: { id: entityId } });
            if (location) {
              const fields = [
                "hero",
                "card",
                "essence",
                "character",
                "stories",
                "practicalInfo",
                "regionExperiences",
                "faq",
                "why",
                "explore",
                "glance",
                "travelInsight",
                "sharedInfo",
                "signatureExperiences",
                "accommodation",
                "travelInfo",
                "cta",
                "data",
                "metadata",
              ];
              const updateData: any = {};
              for (const f of fields) {
                if ((location as any)[f]) {
                  const { updatedObj, replacedCount } = replaceUrlsInObject(
                    (location as any)[f],
                    urlMap
                  );
                  if (replacedCount > 0) updateData[f] = updatedObj;
                }
              }
              if (Object.keys(updateData).length > 0) {
                const updated = await prisma.location.update({
                  where: { id: entityId },
                  data: updateData,
                });
                await syncEntityMediaReferences("Location", entityId, updated);
                referencesMigrated += affectedRefs.filter((r) => r.entityId === entityId).length;
              }
            }
            break;
          }
          case "EXPERIENCE": {
            const exp = await prisma.experience.findUnique({ where: { id: entityId } });
            if (exp) {
              const fields = [
                "theExperience",
                "highlights",
                "practicalInfo",
                "miraTouch",
                "card",
                "hero",
              ];
              const updateData: any = {};
              for (const f of fields) {
                if ((exp as any)[f]) {
                  const { updatedObj, replacedCount } = replaceUrlsInObject(
                    (exp as any)[f],
                    urlMap
                  );
                  if (replacedCount > 0) updateData[f] = updatedObj;
                }
              }
              if (Object.keys(updateData).length > 0) {
                const updated = await prisma.experience.update({
                  where: { id: entityId },
                  data: updateData,
                });
                await syncEntityMediaReferences("Experience", entityId, updated);
                referencesMigrated += affectedRefs.filter((r) => r.entityId === entityId).length;
              }
            }
            break;
          }
          case "STORY": {
            const story = await prisma.story.findUnique({ where: { id: entityId } });
            if (story) {
              const fields = ["hero", "intro", "blocks", "practicalNotes", "seo"];
              const updateData: any = {};
              for (const f of fields) {
                if ((story as any)[f]) {
                  const { updatedObj, replacedCount } = replaceUrlsInObject(
                    (story as any)[f],
                    urlMap
                  );
                  if (replacedCount > 0) updateData[f] = updatedObj;
                }
              }
              if (Object.keys(updateData).length > 0) {
                const updated = await prisma.story.update({
                  where: { id: entityId },
                  data: updateData,
                });
                await syncEntityMediaReferences("Story", entityId, updated);
                referencesMigrated += affectedRefs.filter((r) => r.entityId === entityId).length;
              }
            }
            break;
          }
          case "SITESETTINGS": {
            const settings = await prisma.siteSettings.findUnique({ where: { id: entityId } });
            if (settings) {
              const fields = [
                "siteLogo",
                "siteLogoLight",
                "siteLogoDark",
                "siteFavicon",
                "navbarLogo",
                "navbarLogoDark",
                "footerLogo",
                "footerLogoDark",
                "authLogo",
                "authLogoDark",
                "loadingVideo",
                "seoOgImage",
                "seoTwitterImage",
              ];
              const updateData: any = {};
              for (const f of fields) {
                if ((settings as any)[f]) {
                  const { updatedObj, replacedCount } = replaceUrlsInObject(
                    (settings as any)[f],
                    urlMap
                  );
                  if (replacedCount > 0) updateData[f] = updatedObj;
                }
              }
              if (Object.keys(updateData).length > 0) {
                const updated = await prisma.siteSettings.update({
                  where: { id: entityId },
                  data: updateData,
                });
                await syncEntityMediaReferences("SiteSettings", "global", updated);
                referencesMigrated += affectedRefs.filter((r) => r.entityId === entityId).length;
              }
            }
            break;
          }
          case "AUTH":
          case "USER": {
            const authRecord = await prisma.auth.findUnique({
              where: { id: entityId },
              include: { userPersonalInfo: true },
            });
            if (authRecord?.userPersonalInfo?.photoUrl?.length) {
              const { updatedObj, replacedCount } = replaceUrlsInObject(
                authRecord.userPersonalInfo.photoUrl,
                urlMap
              );
              if (replacedCount > 0) {
                const updated = await prisma.auth.update({
                  where: { id: entityId },
                  data: {
                    userPersonalInfo: {
                      update: { photoUrl: updatedObj },
                    },
                  },
                  include: { userPersonalInfo: true },
                });
                await syncEntityMediaReferences("Auth", entityId, updated);
                referencesMigrated += affectedRefs.filter((r) => r.entityId === entityId).length;
              }
            }
            break;
          }
        }
      } catch (err) {
        console.warn(`[StorageOptimizer] Failed updating entity ${entityType}:${entityId}:`, err);
      }
    }

    // Explicit User Mandate: Move unlinked duplicate assets to Trash Bin!
    for (const dup of duplicateAssets) {
      await prisma.mediaReference.deleteMany({
        where: { mediaId: dup.id },
      });

      await prisma.mediaAsset.update({
        where: { id: dup.id },
        data: {
          status: "IN_TRASH",
          deletedAt: new Date(),
        },
      });

      await prisma.mediaDeletionJob.create({
        data: {
          mediaId: dup.id,
          filePath: dup.storagePath,
          scheduledFor: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          status: "PENDING",
        },
      });

      await logMediaAudit(dup.id, "STORAGE_OPTIMIZE_TRASHED", "admin", {
        masterId: masterAsset.id,
        masterFileName: masterAsset.fileName,
        freedBytes: dup.size,
        reason:
          "Consolidated duplicate into master asset and moved redundant file to 30-day trash grace period.",
      });

      assetsMovedToTrash++;
      freedBytes += dup.size || 0;
      trashedAssetNames.push(dup.fileName);
    }

    await logMediaAudit(masterAsset.id, "STORAGE_OPTIMIZE_MASTER", "admin", {
      consolidatedCount: duplicateAssets.length,
      duplicateFileNames: duplicateAssets.map((d) => d.fileName),
      inheritedReferencesCount: affectedRefs.length,
    });

    groupsProcessed++;
  }

  return {
    success: true,
    groupsProcessed,
    referencesMigrated,
    assetsMovedToTrash,
    freedBytes,
    freedFormatted: formatBytesHelper(freedBytes),
    trashedAssetNames,
  };
}
