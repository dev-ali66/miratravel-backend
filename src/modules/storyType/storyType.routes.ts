import { Router } from "express";
import { publicApiLimiter } from "../../middlewares/limiter.middleware.js";
import { validate } from "../../middlewares/zod.middleware.js";
import {
  createStoryTypeController,
  deleteStoryTypeController,
  getStoryTypesController,
} from "./storyType.controller.js";
import {
  createStoryTypeValidator,
  deleteStoryTypeValidator,
  getStoryTypesValidator,
} from "./storyType.validator.js";

const router = Router();

router.get(
  "/",
  publicApiLimiter,
  validate(getStoryTypesValidator),
  getStoryTypesController,
);

router.post(
  "/",
  publicApiLimiter,
  validate(createStoryTypeValidator),
  createStoryTypeController,
);

router.delete(
  "/:id",
  publicApiLimiter,
  validate(deleteStoryTypeValidator),
  deleteStoryTypeController,
);

export default router;
