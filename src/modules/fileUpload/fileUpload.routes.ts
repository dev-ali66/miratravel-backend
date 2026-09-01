import { Router } from "express";
import { protect } from "../../middlewares/auth.middleware.js";
import { publicApiLimiter } from "../../middlewares/limiter.middleware.js";
import { accessMiddleware } from "../../middlewares/accessControl.middleware.js";
import { uploadFile } from "../../middlewares/multer.middleware.js";
import { validate } from "../../middlewares/zod.middleware.js";
import { manageAllFileUploadController } from "./fileUpload.controller.js";

const router = Router();

router.post(
  "/",
  protect,
  publicApiLimiter,
  // accessMiddleware("beach"),
  ...uploadFile(["image", "video", "file"], [10, 100, 10], 10),
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
