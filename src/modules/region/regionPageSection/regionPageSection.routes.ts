import { Router } from "express";

import { protect } from "../../../middlewares/auth.middleware.js";
import { publicApiLimiter } from "../../../middlewares/limiter.middleware.js";
import { accessMiddleware } from "../../../middlewares/accessControl.middleware.js";
import { uploadFile } from "../../../middlewares/multer.middleware.js";
import { validate } from "../../../middlewares/zod.middleware.js";

import {
  getRegionPageSectionController,
  manageRegionPageSectionController,
  deleteRegionPageSectionController,
} from "./regionPageSection.controller.js";

import {
  getRegionPageSectionValidator,
  manageRegionPageSectionValidator,
} from "./regionPageSection.validator.js";

const router = Router();

// GET Region Page Sections

router.get(
  "/",
  publicApiLimiter,
  validate(getRegionPageSectionValidator),
  getRegionPageSectionController,
);

// CREATE / UPDATE Region Page Section

router.post(
  "/",
  protect,
  publicApiLimiter,
  accessMiddleware("Location"),
  ...uploadFile(),
  validate(manageRegionPageSectionValidator),
  manageRegionPageSectionController,
);

// DELETE Region Page Section

router.delete(
  "/",
  protect,
  publicApiLimiter,
  ...uploadFile(),
  accessMiddleware("Location"),
  deleteRegionPageSectionController,
);

export default router;