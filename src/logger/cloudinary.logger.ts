import { logger } from "./logger.logger.js";

interface CloudinaryBaseLog {
  requestId?: string;
  userId?: string;
  ip?: string;
  userAgent?: string;
  duration?: number;
}

interface UploadSuccessLog extends CloudinaryBaseLog {
  publicId: string;
  assetId?: string;
  folder?: string;
  resourceType?: string;
  format?: string;
  bytes?: number;
  width?: number;
  height?: number;
  version?: number;
}

interface UploadFailedLog extends CloudinaryBaseLog {
  error: unknown;
  folder?: string;
  resourceType?: string;
}

interface DeleteSuccessLog extends CloudinaryBaseLog {
  publicId: string;
  result: string;
}

interface DeleteFailedLog extends CloudinaryBaseLog {
  publicId: string;
  error: unknown;
}

interface RenameSuccessLog extends CloudinaryBaseLog {
  from: string;
  to: string;
}

interface RenameFailedLog extends CloudinaryBaseLog {
  from: string;
  to: string;
  error: unknown;
}

interface BulkDeleteLog extends CloudinaryBaseLog {
  total: number;
  deleted: number;
  failed: number;
}

class CloudinaryLogger {
  uploadSuccess(data: UploadSuccessLog) {
    logger.info("Cloudinary upload successful", {
      event: "CLOUDINARY_UPLOAD_SUCCESS",
      ...data,
    });
  }

  uploadFailed(data: UploadFailedLog) {
    logger.error("Cloudinary upload failed", {
      event: "CLOUDINARY_UPLOAD_FAILED",
      ...data,
    });
  }

  deleteSuccess(data: DeleteSuccessLog) {
    logger.info("Cloudinary delete successful", {
      event: "CLOUDINARY_DELETE_SUCCESS",
      ...data,
    });
  }

  deleteFailed(data: DeleteFailedLog) {
    logger.error("Cloudinary delete failed", {
      event: "CLOUDINARY_DELETE_FAILED",
      ...data,
    });
  }

  renameSuccess(data: RenameSuccessLog) {
    logger.info("Cloudinary rename successful", {
      event: "CLOUDINARY_RENAME_SUCCESS",
      ...data,
    });
  }

  renameFailed(data: RenameFailedLog) {
    logger.error("Cloudinary rename failed", {
      event: "CLOUDINARY_RENAME_FAILED",
      ...data,
    });
  }

  bulkDelete(data: BulkDeleteLog) {
    logger.info("Cloudinary bulk delete completed", {
      event: "CLOUDINARY_BULK_DELETE",
      ...data,
    });
  }

  apiError(operation: string, error: unknown, meta?: Record<string, unknown>) {
    logger.error("Cloudinary API error", {
      event: "CLOUDINARY_API_ERROR",
      operation,
      error,
      ...meta,
    });
  }

  rateLimited(meta?: Record<string, unknown>) {
    logger.warn("Cloudinary rate limit reached", {
      event: "CLOUDINARY_RATE_LIMIT",
      ...meta,
    });
  }
}

export const cloudinaryLogger = new CloudinaryLogger();