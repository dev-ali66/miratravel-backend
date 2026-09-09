import { Router } from "express";
import { protect } from "../../middlewares/auth.middleware.js";
import { accessMiddleware } from "../../middlewares/accessControl.middleware.js";
import { validate } from "../../middlewares/zod.middleware.js";
import { publicApiLimiter } from "../../middlewares/limiter.middleware.js";

import {
  createConciergeLeadController,
  getConciergeLeadsController,
  updateConciergeLeadController,
} from "./concierge.controller.js";

import {
  createConciergeLeadValidator,
  getConciergeLeadsValidator,
  updateConciergeLeadValidator,
} from "./concierge.validator.js";

const router = Router();

// Public endpoint for frontend submissions
router.post(
  "/",
  publicApiLimiter,
  validate(createConciergeLeadValidator),
  createConciergeLeadController
);

// Admin endpoints
router.get(
  "/",
  protect,
  accessMiddleware("ConciergeLead"), // Assuming permission entity is ConciergeLead
  validate(getConciergeLeadsValidator),
  getConciergeLeadsController
);

router.patch(
  "/:id",
  protect,
  accessMiddleware("ConciergeLead"),
  validate(updateConciergeLeadValidator),
  updateConciergeLeadController
);

export default router;
