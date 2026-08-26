import { Router } from "express";

import { protect } from "../../../middlewares/auth.middleware.js";
import { publicApiLimiter } from "../../../middlewares/limiter.middleware.js";
import { accessMiddleware } from "../../../middlewares/accessControl.middleware.js";
import { uploadFile } from "../../../middlewares/multer.middleware.js";
import { validate } from "../../../middlewares/zod.middleware.js";

import {
  getJourneyItineraryController,
  manageJourneyItineraryController,
  deleteJourneyItineraryController,
} from "./journeyItinerary.controller.js";

import {
  getJourneyItineraryValidator,
  manageJourneyItineraryValidator,
} from "./journeyItinerary.validator.js";

const router = Router();

// GET Country Page Sections
router.get(
  "/",
  publicApiLimiter,
  validate(getJourneyItineraryValidator),
  getJourneyItineraryController,
);

// CREATE / UPDATE Country Page Section
router.post(
  "/",
  protect,
  publicApiLimiter,
  accessMiddleware("Journey"),
  ...uploadFile(),
  validate(manageJourneyItineraryValidator),
  manageJourneyItineraryController,
);

// DELETE Country Page Section
router.delete(
  "/",
  protect,
  publicApiLimiter,
  ...uploadFile(),
  accessMiddleware("Journey"),
  deleteJourneyItineraryController,
);

export default router;