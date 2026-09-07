import { Router } from "express";

import { protect } from "../../middlewares/auth.middleware.js";
import { publicApiLimiter } from "../../middlewares/limiter.middleware.js";
import { accessMiddleware } from "../../middlewares/accessControl.middleware.js";
import { uploadFile } from "../../middlewares/multer.middleware.js";
import { validate } from "../../middlewares/zod.middleware.js";

import {
  deleteStoryController,
  getStoryController,
  manageStoryController,
} from "./story.controller.js";

import {
  getStoryValidator,
  manageStoryValidator,
} from "./story.validator.js";

const router = Router();

router.get(
  "/",
  publicApiLimiter,
  validate(getStoryValidator),
  getStoryController,
);

router.post(
  "/",
  protect,
  publicApiLimiter,
  accessMiddleware("Story"),
  ...uploadFile(),
  validate(manageStoryValidator),
  manageStoryController,
);

router.delete(
  "/",
  protect,
  publicApiLimiter,
  accessMiddleware("Story"),
  deleteStoryController,
);

export default router;
