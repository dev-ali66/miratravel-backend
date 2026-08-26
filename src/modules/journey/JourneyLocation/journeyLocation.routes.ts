import { Router } from "express";

import { protect } from "../../../middlewares/auth.middleware.js";
import { publicApiLimiter } from "../../../middlewares/limiter.middleware.js";
import { accessMiddleware } from "../../../middlewares/accessControl.middleware.js";
import { uploadFile } from "../../../middlewares/multer.middleware.js";
import { validate } from "../../../middlewares/zod.middleware.js";

import {
  getJourneyLocationController,
  manageJourneyLocationController,
  deleteJourneyLocationController,
} from "./journeyLocation.controller.js";

import {
  getJourneyLocationValidator,
  manageJourneyLocationValidator,
} from "./journeyLocation.validator.js";

const router = Router();

// GET Country Page Sections
router.get(
  "/",
  publicApiLimiter,
  validate(getJourneyLocationValidator),
  getJourneyLocationController,
);

// CREATE / UPDATE Country Page Section
router.post(
  "/",
  protect,
  publicApiLimiter,
  accessMiddleware("Journey"),
  ...uploadFile(),
  validate(manageJourneyLocationValidator),
  manageJourneyLocationController,
);

// DELETE Country Page Section
router.delete(
  "/",
  protect,
  publicApiLimiter,
  ...uploadFile(),
  accessMiddleware("Journey"),
  deleteJourneyLocationController,
);

export default router;