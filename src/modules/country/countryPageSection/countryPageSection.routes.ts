import { Router } from "express";

import { protect } from "../../../middlewares/auth.middleware.js";
import { publicApiLimiter } from "../../../middlewares/limiter.middleware.js";
import { accessMiddleware } from "../../../middlewares/accessControl.middleware.js";
import { uploadFile } from "../../../middlewares/multer.middleware.js";
import { validate } from "../../../middlewares/zod.middleware.js";

import {
  getCountryPageSectionController,
  manageCountryPageSectionController,
  deleteCountryPageSectionController,
} from "./countryPageSection.controller.js";

import {
  getCountryPageSectionValidator,
  manageCountryPageSectionValidator,
} from "./countryPageSection.validator.js";

const router = Router();

// GET Country Page Sections
router.get(
  "/",
  publicApiLimiter,
  validate(getCountryPageSectionValidator),
  getCountryPageSectionController,
);

// CREATE / UPDATE Country Page Section
router.post(
  "/",
  protect,
  publicApiLimiter,
  accessMiddleware("Location"),
  ...uploadFile(),
  validate(manageCountryPageSectionValidator),
  manageCountryPageSectionController,
);

// DELETE Country Page Section
router.delete(
  "/",
  protect,
  publicApiLimiter,
  ...uploadFile(),
  accessMiddleware("Location"),
  deleteCountryPageSectionController,
);

export default router;
