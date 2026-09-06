import { Router } from "express";

import { protect } from "../../../middlewares/auth.middleware.js";
import { publicApiLimiter } from "../../../middlewares/limiter.middleware.js";
import { accessMiddleware } from "../../../middlewares/accessControl.middleware.js";
import { uploadFile } from "../../../middlewares/multer.middleware.js";
import { validate } from "../../../middlewares/zod.middleware.js";

import {
  getRegionPageController,
  manageRegionPageController,
  deleteRegionPageController,
} from "./regionPage.controller.js";

import {
  getRegionPageValidator,
  manageRegionPageValidator,
} from "./regionPage.validator.js";

const router = Router();

// GET Region Pages
router.get(
  "/",
  publicApiLimiter,
  validate(getRegionPageValidator),
  getRegionPageController,
);

// CREATE / UPDATE Region Page
router.post(
  "/",
  protect,
  publicApiLimiter,
  accessMiddleware("Location"),
  ...uploadFile(),
  validate(manageRegionPageValidator),
  manageRegionPageController,
);

// DELETE Region Page
router.delete(
  "/",
  protect,
  publicApiLimiter,
  ...uploadFile(),
  accessMiddleware("Location"),
  deleteRegionPageController,
);

export default router;
