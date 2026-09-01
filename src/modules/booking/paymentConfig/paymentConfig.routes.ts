import { Router } from "express";

import { protect } from "../../../middlewares/auth.middleware.js";
import { publicApiLimiter } from "../../../middlewares/limiter.middleware.js";
import { accessMiddleware } from "../../../middlewares/accessControl.middleware.js";
import { validate } from "../../../middlewares/zod.middleware.js";

import {
  getPaymentConfigController,
  upsertPaymentConfigController,
} from "./paymentConfig.controller.js";

import {
  getPaymentConfigValidator,
  upsertPaymentConfigValidator,
} from "./paymentConfig.validator.js";

const router = Router();

// GET config for a scope ("global" default, or "journey:<id>")
router.get(
  "/",
  protect,
  publicApiLimiter,
  accessMiddleware("PaymentConfig"),
  validate(getPaymentConfigValidator),
  getPaymentConfigController,
);

// Create/update config for a scope
router.post(
  "/",
  protect,
  publicApiLimiter,
  accessMiddleware("PaymentConfig"),
  validate(upsertPaymentConfigValidator),
  upsertPaymentConfigController,
);

export default router;
