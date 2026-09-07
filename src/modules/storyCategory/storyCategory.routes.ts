import { Router } from "express";
import { protect } from "../../middlewares/auth.middleware.js";
import { publicApiLimiter } from "../../middlewares/limiter.middleware.js";
import { validate } from "../../middlewares/zod.middleware.js";

import {
  createStoryCategoryController,
  deleteStoryCategoryController,
  getStoryCategoriesController,
} from "./storyCategory.controller.js";

import {
  createStoryCategoryValidator,
  deleteStoryCategoryValidator,
  getStoryCategoryValidator,
} from "./storyCategory.validator.js";

const router = Router();

router.get(
  "/",
  publicApiLimiter,
  validate(getStoryCategoryValidator),
  getStoryCategoriesController,
);

router.post(
  "/",
  protect,
  publicApiLimiter,
  validate(createStoryCategoryValidator),
  createStoryCategoryController,
);

router.delete(
  "/:id",
  protect,
  publicApiLimiter,
  validate(deleteStoryCategoryValidator),
  deleteStoryCategoryController,
);

export default router;
