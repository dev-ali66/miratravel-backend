import { Router } from "express";

import { protect } from "../../middlewares/auth.middleware.js";
import { publicApiLimiter } from "../../middlewares/limiter.middleware.js";
import { accessMiddleware } from "../../middlewares/accessControl.middleware.js";
import { uploadFile } from "../../middlewares/multer.middleware.js";
import { validate } from "../../middlewares/zod.middleware.js";

import {
  deleteLocationController,
  getLocationController,
  manageLocationController,
  searchLocationOptionsController,
} from "./location.controller.js";

import {
  getLocationValidator,
  manageLocationValidator,
} from "./location.validator.js";

const router = Router();

router.get(
  "/search",
  publicApiLimiter,
  searchLocationOptionsController,
);

router.get(
  "/",
  publicApiLimiter,
  validate(getLocationValidator),
  getLocationController,
);

router.post(
  "/",
  protect,
  publicApiLimiter,
  accessMiddleware("Location"),
  ...uploadFile(),
  validate(manageLocationValidator),
  manageLocationController,
);

router.delete(
  "/",
  protect,
  publicApiLimiter,
  ...uploadFile(),
  accessMiddleware("Location"),
  deleteLocationController,
);

export default router;
