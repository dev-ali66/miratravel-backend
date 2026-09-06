import { Router } from "express";

import { protect } from "../../../middlewares/auth.middleware.js";
import { publicApiLimiter } from "../../../middlewares/limiter.middleware.js";
import { accessMiddleware } from "../../../middlewares/accessControl.middleware.js";
import { uploadFile } from "../../../middlewares/multer.middleware.js";
import { validate } from "../../../middlewares/zod.middleware.js";

import {
  getJourneyController,
  manageJourneyController,
  deleteJourneyController,
} from "./journey.controller.js";

import {
  getJourneyValidator,
  manageJourneyValidator,
} from "./journey.validator.js";

const router = Router();

router.get(
  "/",
  publicApiLimiter,
  validate(getJourneyValidator),
  getJourneyController,
);

router.post(
  "/",
  protect,
  publicApiLimiter,
  accessMiddleware("Journey"),
  ...uploadFile(),
  validate(manageJourneyValidator),
  manageJourneyController,
);

router.delete(
  "/",
  protect,
  publicApiLimiter,
  ...uploadFile(),
  accessMiddleware("Journey"),
  deleteJourneyController,
);

export default router;
