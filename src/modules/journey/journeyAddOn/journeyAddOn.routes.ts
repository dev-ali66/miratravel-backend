import { Router } from "express";

import { protect } from "../../../middlewares/auth.middleware.js";
import { publicApiLimiter } from "../../../middlewares/limiter.middleware.js";
import { accessMiddleware } from "../../../middlewares/accessControl.middleware.js";
import { validate } from "../../../middlewares/zod.middleware.js";

import {
  getJourneyAddOnController,
  manageJourneyAddOnController,
  deleteJourneyAddOnController,
} from "./journeyAddOn.controller.js";

import {
  getJourneyAddOnValidator,
  manageJourneyAddOnValidator,
} from "./journeyAddOn.validator.js";

const router = Router();

// GET Journey <-> AddOn attachments
router.get(
  "/",
  publicApiLimiter,
  validate(getJourneyAddOnValidator),
  getJourneyAddOnController,
);

// ATTACH an AddOn to a Journey
router.post(
  "/",
  protect,
  publicApiLimiter,
  accessMiddleware("Journey"),
  validate(manageJourneyAddOnValidator),
  manageJourneyAddOnController,
);

// DETACH an AddOn from a Journey
router.delete(
  "/",
  protect,
  publicApiLimiter,
  accessMiddleware("Journey"),
  deleteJourneyAddOnController,
);

export default router;
