import fs from "fs";
import path from "path";
import { StatusCodes } from "http-status-codes";
import prisma from "../../config/prisma.js";
import ApiError from "../../utils/api.error.js";
import {
  assertMediaCanBeDeleted,
  getMediaUsage as getMediaUsageReport,
} from "../../shared/mediaReference.service.js";
import { deleteFromLocalStorage } from "../../shared/upload_local.service.js";
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
  sortBy?: "createdAt" | "size" | "fileName" | "title";
  sortOrder?: "asc" | "desc";
}

/**
 * Logs mutation actions to MediaAuditLog table.
 */
async function logMediaAudit(
  mediaId: string,
  action: "UPLOAD" | "DEDUPLICATED" | "UPDATE" | "MOVE_TO_TRASH" | "RESTORE" | "PURGE",
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

  // Sorting
  const sortBy = params.sortBy || "createdAt";
  const sortOrder = params.sortOrder || "desc";
  const orderBy = { [sortBy]: sortOrder };

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

  const data = items.map((item) => ({
    ...item,
    usageCount: item._count.references,
    _count: undefined,
  }));

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

  return {
    totalAssets,
    activeAssets,
    trashedAssets,
    totalImages,
    totalVideos,
    totalSizeBytes,
    totalSizeMB,
    unusedAssets,
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

  // Delete DB record
  await prisma.mediaAsset.delete({
    where: { id },
  });

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
