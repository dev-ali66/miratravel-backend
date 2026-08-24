import { Router } from "express";

import { protect } from "../../../middlewares/auth.middleware.js";
import { publicApiLimiter } from "../../../middlewares/limiter.middleware.js";
import { accessMiddleware } from "../../../middlewares/accessControl.middleware.js";
import { uploadFile } from "../../../middlewares/multer.middleware.js";
import { validate } from "../../../middlewares/zod.middleware.js";

import {
  getPlacePageSectionController,
  managePlacePageSectionController,
  deletePlacePageSectionController,
} from "./placePageSection.controller.js";

import {
  getPlacePageSectionValidator,
  managePlacePageSectionValidator,
} from "./placePageSection.validator.js";

const router = Router();

// GET Place Page Sections

router.get(
  "/",
  publicApiLimiter,
  validate(getPlacePageSectionValidator),
  getPlacePageSectionController,
);

// CREATE / UPDATE Place Page Section

router.post(
  "/",
  protect,
  publicApiLimiter,
  accessMiddleware("Location"),
  ...uploadFile(),
  validate(managePlacePageSectionValidator),
  managePlacePageSectionController,
);

// DELETE Place Page Section

router.delete(
  "/",
  protect,
  publicApiLimiter,
  ...uploadFile(),
  accessMiddleware("Location"),
  deletePlacePageSectionController,
);

export default router;