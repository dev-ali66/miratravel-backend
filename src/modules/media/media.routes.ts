import { Router } from "express";
import { validate } from "../../middlewares/zod.middleware.js";
import {
  bulkRestoreController,
  bulkSoftDeleteController,
  emptyTrashController,
  getMediaByIdController,
  getMediaGalleryController,
  getMediaStatsController,
  getMediaUsageController,
  permanentDeleteMediaController,
  restoreMediaController,
  softDeleteMediaController,
  updateMediaMetadataController,
  uploadMediaController,
  checkMediaHashController,
  getMediaWorkerStatusController,
  triggerMediaWorkerController,
  triggerMediaReconcilerController,
  scanStorageOptimizationController,
  executeStorageOptimizationController,
  downloadMediaController,
} from "./media.controller.js";
import { mediaMulterUpload } from "./mediaStorage.util.js";
import {
  bulkMediaActionValidator,
  getMediaByIdValidator,
  getMediaGalleryValidator,
  updateMediaMetadataValidator,
} from "./media.validator.js";
import { optimizeMediaRouteHandler } from "./imageOptimizer.service.js";

const router = Router();

// 0. On-demand dynamic image optimization endpoint (supports both local & legacy Cloudinary URLs)
router.get("/optimize", optimizeMediaRouteHandler);

// 0. Pre-upload instant hash check (Zero-byte client-side deduplication)
router.get("/check-hash/:hash", checkMediaHashController);
router.post("/check-hash", checkMediaHashController);

// 1. Gallery list & KPI stats
router.get("/", validate(getMediaGalleryValidator), getMediaGalleryController);
router.get("/stats", getMediaStatsController);

// 2. Upload endpoints (multi-file & single-file)
router.post(
  "/upload",
  mediaMulterUpload.array("files", 20),
  uploadMediaController
);
router.post(
  "/upload-single",
  mediaMulterUpload.single("file"),
  uploadMediaController
);

// 3. Bulk actions & Empty Trash (must precede /:id)
router.post(
  "/bulk-trash",
  validate(bulkMediaActionValidator),
  bulkSoftDeleteController
);
router.post(
  "/bulk-restore",
  validate(bulkMediaActionValidator),
  bulkRestoreController
);
router.post("/trash/empty", emptyTrashController);

// 3.5. Outbox Worker & Reconciler management endpoints (must precede /:id)
router.get("/worker/status", getMediaWorkerStatusController);
router.post("/worker/trigger", triggerMediaWorkerController);
router.post("/worker/reconcile", triggerMediaReconcilerController);

// 3.6. Universal Storage Optimizer endpoints (must precede /:id)
router.get("/optimizer/scan", scanStorageOptimizationController);
router.post("/optimizer/execute", executeStorageOptimizationController);

// 4. Single asset operations
router.get("/:id", validate(getMediaByIdValidator), getMediaByIdController);
router.get(
  "/:id/usage",
  validate(getMediaByIdValidator),
  getMediaUsageController
);
router.get(
  "/:id/download",
  validate(getMediaByIdValidator),
  downloadMediaController
);
router.patch(
  "/:id",
  validate(updateMediaMetadataValidator),
  updateMediaMetadataController
);
router.delete(
  "/:id",
  validate(getMediaByIdValidator),
  softDeleteMediaController
);
router.post(
  "/:id/restore",
  validate(getMediaByIdValidator),
  restoreMediaController
);
router.delete(
  "/:id/permanent",
  validate(getMediaByIdValidator),
  permanentDeleteMediaController
);

export default router;
