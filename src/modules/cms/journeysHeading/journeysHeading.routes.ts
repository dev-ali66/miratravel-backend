import { Router } from "express";
import { protect } from "../../../middlewares/auth.middleware.js";
import { publicApiLimiter } from "../../../middlewares/limiter.middleware.js";
import {
  deletejourneysHeadingController,
  getjourneysHeadingController,
  managejourneysHeadingController,
} from "./journeysHeading.controller.js";
import { accessMiddleware } from "../../../middlewares/accessControl.middleware.js";
import { uploadFile } from "../../../middlewares/multer.middleware.js";
import { validate } from "../../../middlewares/zod.middleware.js";
import {
  getjourneysHeadingValidator,
  managejourneysHeadingValidator,
} from "./journeysHeading.validator.js";

const router = Router();

router.get(
  "/",
  publicApiLimiter,
  validate(getjourneysHeadingValidator),
  getjourneysHeadingController,
);
router.post(
  "/",
  protect,
  publicApiLimiter,
  accessMiddleware("journeysHeading"),
  ...uploadFile(["image", "video"], [10, 100], 10),
  validate(managejourneysHeadingValidator),
  managejourneysHeadingController,
);
router.delete(
  "/",
  protect,
  publicApiLimiter,
  accessMiddleware("journeysHeading"),
  deletejourneysHeadingController,
);

export default router;
