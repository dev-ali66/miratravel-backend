import { Request, Response } from "express";
import catchAsync from "../../utils/catch.async.js";
import successResponse from "../../utils/success.response.js";
import {
  bulkRestore,
  bulkSoftDelete,
  emptyTrash,
  getMediaById,
  getMediaGallery,
  getMediaStats,
  getMediaUsage,
  permanentDeleteMedia,
  restoreMedia,
  softDeleteMedia,
  updateMediaMetadata,
  uploadMediaAssets,
  checkMediaHash,
} from "./media.service.js";

export const getMediaGalleryController = catchAsync(
  async (req: Request, res: Response) => {
    const result = await getMediaGallery(req.query as any);
    return successResponse({
      res,
      message: "Media gallery retrieved successfully",
      data: result.data,
      meta: result.meta,
    });
  }
);

export const getMediaStatsController = catchAsync(
  async (_req: Request, res: Response) => {
    const stats = await getMediaStats();
    return successResponse({
      res,
      message: "Media statistics retrieved successfully",
      data: stats,
    });
  }
);

export const getMediaByIdController = catchAsync(
  async (req: Request, res: Response) => {
    const id = String(req.params.id);
    const asset = await getMediaById(id);
    return successResponse({
      res,
      message: "Media asset retrieved successfully",
      data: asset,
    });
  }
);

export const getMediaUsageController = catchAsync(
  async (req: Request, res: Response) => {
    const id = String(req.params.id);
    const usage = await getMediaUsage(id);
    return successResponse({
      res,
      message: "Media asset usage retrieved successfully",
      data: usage,
    });
  }
);

export const uploadMediaController = catchAsync(
  async (req: Request, res: Response) => {
    // Multer single or array of files
    const files = req.files
      ? (req.files as Express.Multer.File[])
      : req.file
      ? [req.file]
      : [];

    const userId = (req as any).user?.id;
    const uploaded = await uploadMediaAssets(files, userId);

    return successResponse({
      res,
      message: `Successfully processed ${uploaded.length} media file(s)`,
      data: uploaded,
      code: 201,
    });
  }
);

export const updateMediaMetadataController = catchAsync(
  async (req: Request, res: Response) => {
    const id = String(req.params.id);
    const userId = (req as any).user?.id;
    const updated = await updateMediaMetadata(id, req.body, userId);

    return successResponse({
      res,
      message: "Media metadata updated successfully",
      data: updated,
    });
  }
);

export const softDeleteMediaController = catchAsync(
  async (req: Request, res: Response) => {
    const id = String(req.params.id);
    const userId = (req as any).user?.id;
    const trashed = await softDeleteMedia(id, userId);

    return successResponse({
      res,
      message: "Media asset moved to trash successfully",
      data: trashed,
    });
  }
);

export const restoreMediaController = catchAsync(
  async (req: Request, res: Response) => {
    const id = String(req.params.id);
    const userId = (req as any).user?.id;
    const restored = await restoreMedia(id, userId);

    return successResponse({
      res,
      message: "Media asset restored successfully",
      data: restored,
    });
  }
);

export const permanentDeleteMediaController = catchAsync(
  async (req: Request, res: Response) => {
    const id = String(req.params.id);
    const userId = (req as any).user?.id;
    const result = await permanentDeleteMedia(id, userId);

    return successResponse({
      res,
      message: "Media asset permanently deleted",
      data: result,
    });
  }
);

export const emptyTrashController = catchAsync(
  async (req: Request, res: Response) => {
    const userId = (req as any).user?.id;
    const result = await emptyTrash(userId);

    return successResponse({
      res,
      message: `Trash emptied. Permanently deleted ${result.deletedCount} unused asset(s)`,
      data: result,
    });
  }
);

export const bulkSoftDeleteController = catchAsync(
  async (req: Request, res: Response) => {
    const { ids } = req.body;
    const userId = (req as any).user?.id;
    const result = await bulkSoftDelete(ids, userId);

    return successResponse({
      res,
      message: `Bulk trash completed: ${result.trashedCount} moved to trash, ${result.blocked.length} blocked by active usage`,
      data: result,
    });
  }
);

export const bulkRestoreController = catchAsync(
  async (req: Request, res: Response) => {
    const { ids } = req.body;
    const userId = (req as any).user?.id;
    const result = await bulkRestore(ids, userId);

    return successResponse({
      res,
      message: `Bulk restore completed: ${result.restoredCount} asset(s) restored`,
      data: result,
    });
  }
);

export const checkMediaHashController = catchAsync(
  async (req: Request, res: Response) => {
    const hash = req.params.hash || req.body?.hash || req.query?.hash;
    const result = await checkMediaHash(String(hash || ""));

    return successResponse({
      res,
      message: result.exists
        ? "Existing media asset found by hash"
        : "No asset matches this hash",
      data: result,
    });
  }
);

export const getMediaWorkerStatusController = catchAsync(
  async (_req: Request, res: Response) => {
    const { getMediaWorkerStatus } = await import("../../workers/mediaWorker.js");
    const status = await getMediaWorkerStatus();
    return successResponse({
      res,
      message: "Media worker status retrieved successfully",
      data: status,
    });
  }
);

export const triggerMediaWorkerController = catchAsync(
  async (req: Request, res: Response) => {
    const { processPendingMediaDeletionJobs } = await import("../../workers/mediaWorker.js");
    const batchSize = req.body?.batchSize ? Number(req.body.batchSize) : 50;
    const result = await processPendingMediaDeletionJobs(batchSize);
    return successResponse({
      res,
      message: "Media cleanup worker cycle executed successfully",
      data: result,
    });
  }
);

export const triggerMediaReconcilerController = catchAsync(
  async (_req: Request, res: Response) => {
    const { runMediaReconciler } = await import("../../jobs/reconcileMedia.job.js");
    const result = await runMediaReconciler();
    return successResponse({
      res,
      message: "Media self-healing reconciler executed successfully",
      data: result,
    });
  }
);


