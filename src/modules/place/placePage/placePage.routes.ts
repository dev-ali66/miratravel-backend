import { Router } from "express";

import { protect } from "../../../middlewares/auth.middleware.js";

import { publicApiLimiter } from "../../../middlewares/limiter.middleware.js";

import { accessMiddleware } from "../../../middlewares/accessControl.middleware.js";

import { uploadFile } from "../../../middlewares/multer.middleware.js";

import { validate } from "../../../middlewares/zod.middleware.js";

import {
  getPlacePageController,
  managePlacePageController,
  deletePlacePageController,
} from "./placePage.controller.js";

import {
  getPlacePageValidator,
  managePlacePageValidator,
} from "./placePage.validator.js";

const router = Router();

// GET Place Pages

router.get(
  "/",
  publicApiLimiter,
  validate(getPlacePageValidator),
  getPlacePageController,
);

// CREATE / UPDATE Place Page

router.post(
  "/",
  protect,
  publicApiLimiter,
  accessMiddleware("Location"),
  ...uploadFile(),
  validate(managePlacePageValidator),
  managePlacePageController,
);

// DELETE Place Page

router.delete(
  "/",
  protect,
  publicApiLimiter,
  ...uploadFile(),
  accessMiddleware("Location"),
  deletePlacePageController,
);

export default router;