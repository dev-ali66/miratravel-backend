import { Router } from "express";
import { validate } from "../../middlewares/zod.middleware.js";
import { publicApiLimiter } from "../../middlewares/limiter.middleware.js";

import {
  createInquiryController,
  getInquiriesController,
  updateInquiryController,
  deleteInquiryController,
} from "./inquiry.controller.js";

import {
  createInquiryValidator,
  getInquiriesValidator,
  updateInquiryValidator,
} from "./inquiry.validator.js";

const router = Router();

// Public endpoint for frontend inquiry submission
router.post(
  "/",
  publicApiLimiter,
  validate(createInquiryValidator),
  createInquiryController
);

// Admin endpoints
router.get(
  "/",
  validate(getInquiriesValidator),
  getInquiriesController
);

router.patch(
  "/:id",
  validate(updateInquiryValidator),
  updateInquiryController
);

router.delete(
  "/:id",
  deleteInquiryController
);

export default router;
