import { Router } from "express";

import { protect } from "../../../middlewares/auth.middleware.js";
import { publicApiLimiter } from "../../../middlewares/limiter.middleware.js";
import { accessMiddleware } from "../../../middlewares/accessControl.middleware.js";
import { uploadFile } from "../../../middlewares/multer.middleware.js";
import { validate } from "../../../middlewares/zod.middleware.js";

import {
  getCountryPageController,
  manageCountryPageController,
  deleteCountryPageController,
} from "./countryPage.controller.js";

import {
  getCountryPageValidator,
  manageCountryPageValidator,
} from "./countryPage.validator.js";

const router = Router();

// GET Country Pages
router.get(
  "/",
  publicApiLimiter,
  validate(getCountryPageValidator),
  getCountryPageController,
);

// CREATE / UPDATE Country Page
router.post(
  "/",
  protect,
  publicApiLimiter,
  accessMiddleware("Location"),
  ...uploadFile(),
  validate(manageCountryPageValidator),
  manageCountryPageController,
);

// DELETE Country Page
router.delete(
  "/",
  protect,
  publicApiLimiter,
  ...uploadFile(),
  accessMiddleware("Location"),
  deleteCountryPageController,
);

export default router;