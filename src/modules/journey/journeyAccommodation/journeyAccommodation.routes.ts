import { Router } from "express";

import { protect } from "../../../middlewares/auth.middleware.js";
import { publicApiLimiter } from "../../../middlewares/limiter.middleware.js";
import { accessMiddleware } from "../../../middlewares/accessControl.middleware.js";
import { uploadFile } from "../../../middlewares/multer.middleware.js";
import { validate } from "../../../middlewares/zod.middleware.js";

import {
  getjourneyAccommodationController,
  managejourneyAccommodationController,
  deletejourneyAccommodationController,
} from "./journeyAccommodation.controller.js";

import {
  getjourneyAccommodationValidator,
  managejourneyAccommodationValidator,
} from "./journeyAccommodation.validator.js";

const router = Router();

// GET Country Page Sections
router.get(
  "/",
  publicApiLimiter,
  validate(getjourneyAccommodationValidator),
  getjourneyAccommodationController,
);

// CREATE / UPDATE Country Page Section
router.post(
  "/",
  protect,
  publicApiLimiter,
  accessMiddleware("Journey"),
  ...uploadFile(),
  validate(managejourneyAccommodationValidator),
  managejourneyAccommodationController,
);

// DELETE Country Page Section
router.delete(
  "/",
  protect,
  publicApiLimiter,
  ...uploadFile(),
  accessMiddleware("Journey"),
  deletejourneyAccommodationController,
);

export default router;