import { Router } from "express";

import { protect } from "../../../middlewares/auth.middleware.js";
import { publicApiLimiter } from "../../../middlewares/limiter.middleware.js";
import { accessMiddleware } from "../../../middlewares/accessControl.middleware.js";
import { validate } from "../../../middlewares/zod.middleware.js";

import {
  getPaymentScheduleController,
  overrideScheduleController,
  waiveScheduleItemController,
  sendPaymentRequestController,
  dueOverviewController,
} from "./paymentSchedule.controller.js";

import {
  getPaymentScheduleValidator,
  overrideScheduleValidator,
  waiveScheduleItemValidator,
  sendPaymentRequestValidator,
  dueOverviewValidator,
} from "./paymentSchedule.validator.js";

const router = Router();

// GET payment schedules (admin)
router.get(
  "/",
  protect,
  publicApiLimiter,
  accessMiddleware("PaymentSchedule"),
  validate(getPaymentScheduleValidator),
  getPaymentScheduleController,
);

// Admin dashboard: due / overdue schedule items at a glance (spec §10)
router.get(
  "/due-overview",
  protect,
  publicApiLimiter,
  accessMiddleware("PaymentSchedule"),
  validate(dueOverviewValidator),
  dueOverviewController,
);

// Override the active schedule with a custom set of items (spec §10)
router.post(
  "/override",
  protect,
  publicApiLimiter,
  accessMiddleware("PaymentSchedule"),
  validate(overrideScheduleValidator),
  overrideScheduleController,
);

// Waive/cancel a single schedule item
router.post(
  "/:itemId/waive",
  protect,
  publicApiLimiter,
  accessMiddleware("PaymentSchedule"),
  validate(waiveScheduleItemValidator),
  waiveScheduleItemController,
);

// Send (or re-send) a secure payment link for the next/selected schedule item
router.post(
  "/send-request",
  protect,
  publicApiLimiter,
  accessMiddleware("PaymentSchedule"),
  validate(sendPaymentRequestValidator),
  sendPaymentRequestController,
);

export default router;
