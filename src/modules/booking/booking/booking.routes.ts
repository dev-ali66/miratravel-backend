import { Router } from "express";

import { protect } from "../../../middlewares/auth.middleware.js";
import { publicApiLimiter } from "../../../middlewares/limiter.middleware.js";
import { accessMiddleware } from "../../../middlewares/accessControl.middleware.js";
import { validate } from "../../../middlewares/zod.middleware.js";

import {
  getBookingController,
  createBookingController,
  updateBookingController,
  approveBookingController,
  rejectBookingController,
  cancelBookingController,
  reviseTotalController,
  deleteBookingController,
} from "./booking.controller.js";

import {
  getBookingValidator,
  createBookingRequestValidator,
  updateBookingValidator,
  approveBookingValidator,
  rejectBookingValidator,
  cancelBookingValidator,
  reviseTotalValidator,
} from "./booking.validator.js";

const router = Router();

// GET Bookings — admin/manager only (contains traveler PII, spec §10)
router.get(
  "/",
  protect,
  publicApiLimiter,
  accessMiddleware("Booking"),
  validate(getBookingValidator),
  getBookingController,
);

// CREATE Booking request — "Reserve your journey" form (spec §11: no payment taken here).
// Booking rows require an authenticated owner (createdBy → Auth), so the traveler must be logged in;
// any account holder may create their own request without extra RBAC permissions.
router.post(
  "/",
  protect,
  publicApiLimiter,
  validate(createBookingRequestValidator),
  createBookingController,
);

// UPDATE traveler/logistics details — admin only, pre-approval
router.patch(
  "/:id",
  protect,
  publicApiLimiter,
  accessMiddleware("Booking"),
  validate(updateBookingValidator),
  updateBookingController,
);

// APPROVE — resolves & generates the payment schedule (spec §5, §7)
router.post(
  "/:id/approve",
  protect,
  publicApiLimiter,
  accessMiddleware("Booking"),
  validate(approveBookingValidator),
  approveBookingController,
);

// REJECT — before any payment request is sent
router.post(
  "/:id/reject",
  protect,
  publicApiLimiter,
  accessMiddleware("Booking"),
  validate(rejectBookingValidator),
  rejectBookingController,
);

// CANCEL
router.post(
  "/:id/cancel",
  protect,
  publicApiLimiter,
  accessMiddleware("Booking"),
  validate(cancelBookingValidator),
  cancelBookingController,
);

// REVISE CONFIRMED TOTAL after partial payment (spec §13 rule 79)
router.post(
  "/:id/revise-total",
  protect,
  publicApiLimiter,
  accessMiddleware("Booking"),
  validate(reviseTotalValidator),
  reviseTotalController,
);

// DELETE — admin only, blocked once any payment has been recorded
router.delete(
  "/",
  protect,
  publicApiLimiter,
  accessMiddleware("Booking"),
  deleteBookingController,
);

export default router;
