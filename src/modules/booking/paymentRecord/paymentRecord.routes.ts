import { Router } from "express";

import { protect } from "../../../middlewares/auth.middleware.js";
import { publicApiLimiter } from "../../../middlewares/limiter.middleware.js";
import { accessMiddleware } from "../../../middlewares/accessControl.middleware.js";
import { validate } from "../../../middlewares/zod.middleware.js";

import {
  getPaymentRecordController,
  recordPaymentController,
  refundPaymentController,
} from "./paymentRecord.controller.js";

import {
  getPaymentRecordValidator,
  recordPaymentValidator,
  refundPaymentValidator,
} from "./paymentRecord.validator.js";

const router = Router();

// GET payment records (admin)
router.get(
  "/",
  protect,
  publicApiLimiter,
  accessMiddleware("PaymentRecord"),
  validate(getPaymentRecordValidator),
  getPaymentRecordController,
);

// Record a manual payment, or a PSP transaction outcome (spec §10)
router.post(
  "/",
  protect,
  publicApiLimiter,
  accessMiddleware("PaymentRecord"),
  validate(recordPaymentValidator),
  recordPaymentController,
);

// Full or partial refund — records are never deleted (spec §13 rule 82)
router.post(
  "/:id/refund",
  protect,
  publicApiLimiter,
  accessMiddleware("PaymentRecord"),
  validate(refundPaymentValidator),
  refundPaymentController,
);

export default router;
