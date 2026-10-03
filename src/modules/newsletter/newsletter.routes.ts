import { Router } from "express";
import { protect } from "../../middlewares/auth.middleware.js";
import { publicApiLimiter } from "../../middlewares/limiter.middleware.js";
import { validate } from "../../middlewares/zod.middleware.js";
import {
  subscribeNewsletterController,
  getNewsletterSubscribersController,
  updateNewsletterSubscriberController,
  deleteNewsletterSubscriberController,
} from "./newsletter.controller.js";
import {
  subscribeNewsletterValidator,
  getNewsletterSubscribersValidator,
  updateNewsletterSubscriberValidator,
} from "./newsletter.validator.js";

const router = Router();

// Public routes for subscription
router.post(
  "/",
  publicApiLimiter,
  validate(subscribeNewsletterValidator),
  subscribeNewsletterController
);

router.post(
  "/subscribe",
  publicApiLimiter,
  validate(subscribeNewsletterValidator),
  subscribeNewsletterController
);

// Protected admin routes for subscribers management
router.get(
  "/",
  protect,
  validate(getNewsletterSubscribersValidator),
  getNewsletterSubscribersController
);

router.get(
  "/subscribers",
  protect,
  validate(getNewsletterSubscribersValidator),
  getNewsletterSubscribersController
);

router.patch(
  "/:id",
  protect,
  validate(updateNewsletterSubscriberValidator),
  updateNewsletterSubscriberController
);

router.patch(
  "/subscribers/:id",
  protect,
  validate(updateNewsletterSubscriberValidator),
  updateNewsletterSubscriberController
);

router.delete(
  "/:id",
  protect,
  deleteNewsletterSubscriberController
);

router.delete(
  "/subscribers/:id",
  protect,
  deleteNewsletterSubscriberController
);

export default router;
