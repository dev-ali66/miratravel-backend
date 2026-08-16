import { Router } from "express";
import { protect } from "../../../middlewares/auth.middleware.js";
import { publicApiLimiter } from "../../../middlewares/limiter.middleware.js";
import {
  deletejourneysPricingController,
  getjourneysPricingController,
  managejourneysPricingController,
} from "./journeysPricing.controller.js";
import { accessMiddleware } from "../../../middlewares/accessControl.middleware.js";
import { uploadFile } from "../../../middlewares/multer.middleware.js";
import { validate } from "../../../middlewares/zod.middleware.js";
import {
  getjourneysPricingValidator,
  managejourneysPricingValidator,
} from "./journeysPricing.validator.js";

const router = Router();

router.get(
  "/",
  publicApiLimiter,
  validate(getjourneysPricingValidator),
  getjourneysPricingController,
);
router.post(
  "/",
  protect,
  publicApiLimiter,
  accessMiddleware("journeysPricing"),
  ...uploadFile(["image", "video"], [10, 100], 10),
  validate(managejourneysPricingValidator),
  managejourneysPricingController,
);
router.delete(
  "/",
  protect,
  publicApiLimiter,
  accessMiddleware("journeysPricing"),
  deletejourneysPricingController,
);

export default router;
