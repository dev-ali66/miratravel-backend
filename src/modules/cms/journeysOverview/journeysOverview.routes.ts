import { Router } from "express";
import { protect } from "../../../middlewares/auth.middleware.js";
import { publicApiLimiter } from "../../../middlewares/limiter.middleware.js";
import {
  deletejourneysOverviewController,
  getjourneysOverviewController,
  managejourneysOverviewController,
} from "./journeysOverview.controller.js";
import { accessMiddleware } from "../../../middlewares/accessControl.middleware.js";
import { uploadFile } from "../../../middlewares/multer.middleware.js";
import { validate } from "../../../middlewares/zod.middleware.js";
import {
  getjourneysOverviewValidator,
  managejourneysOverviewValidator,
} from "./journeysOverview.validator.js";

const router = Router();

router.get(
  "/",
  publicApiLimiter,
  validate(getjourneysOverviewValidator),
  getjourneysOverviewController,
);
router.post(
  "/",
  protect,
  publicApiLimiter,
  accessMiddleware("journeysOverview"),
  ...uploadFile(["image", "video"], [10, 100], 10),
  validate(managejourneysOverviewValidator),
  managejourneysOverviewController,
);
router.delete(
  "/",
  protect,
  publicApiLimiter,
  accessMiddleware("journeysOverview"),
  deletejourneysOverviewController,
);

export default router;
