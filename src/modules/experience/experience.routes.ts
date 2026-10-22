import { Router } from "express";

import { protect } from "../../middlewares/auth.middleware.js";
import { publicApiLimiter } from "../../middlewares/limiter.middleware.js";
import { accessMiddleware } from "../../middlewares/accessControl.middleware.js";
import { uploadFile } from "../../middlewares/multer.middleware.js";
import { validate } from "../../middlewares/zod.middleware.js";

import {
  deleteExperienceController,
  getExperienceController,
  manageExperienceController,
  searchExperienceOptionsController,
} from "./experience.controller.js";

import {
  getExperienceValidator,
  manageExperienceValidator,
} from "./experience.validator.js";

const router = Router();

router.get(
  "/search",
  publicApiLimiter,
  searchExperienceOptionsController,
);

router.get(
  "/",
  publicApiLimiter,
  validate(getExperienceValidator),
  getExperienceController,
);

router.post(
  "/",
  protect,
  publicApiLimiter,
  accessMiddleware("Experience"),
  ...uploadFile(),
  validate(manageExperienceValidator),
  manageExperienceController,
);

router.delete(
  "/",
  protect,
  publicApiLimiter,
  ...uploadFile(),
  accessMiddleware("Experience"),
  deleteExperienceController,
);

export default router;
