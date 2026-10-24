import { Router } from "express";
import { protect } from "../../middlewares/auth.middleware.js";
import { publicApiLimiter } from "../../middlewares/limiter.middleware.js";
import { accessMiddleware } from "../../middlewares/accessControl.middleware.js";
import { uploadFile } from "../../middlewares/multer.middleware.js";
import { validate } from "../../middlewares/zod.middleware.js";
import { manageAllFileUploadController } from "./fileUpload.controller.js";
import { checkMediaHashController } from "../media/media.controller.js";

const router = Router();

// Pre-upload instant hash check (Zero-byte client-side deduplication)
router.get("/check-hash/:hash", protect, checkMediaHashController);
router.post("/check-hash", protect, checkMediaHashController);

router.post(
  "/",
  protect,
  publicApiLimiter,
  // accessMiddleware("beach"),
  ...uploadFile(["image", "video", "file"], [30, 500, 30], 10),
  // validate(manageBeachSchemaValidator),
  manageAllFileUploadController,
);

// router.delete(
//     "/",
//     protect,
//     publicApiLimiter,
//     ...uploadFile(),
//     accessMiddleware("beach"),
//     deleteBeachController,
// );

// router.get(
//     "/",
//     publicApiLimiter,
//     // accessMiddleware("beach"),
//     ...uploadFile(),
//     validate(getBeachSchemaValidator),
//     getAllBeachController
// )

export default router;
