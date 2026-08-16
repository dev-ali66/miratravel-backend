import { Router } from "express";
import { protect } from "../../../middlewares/auth.middleware.js";
import { publicApiLimiter } from "../../../middlewares/limiter.middleware.js";
import {
  getPagesController,
  managePagesController,
} from "./pages.controller.js";
import { accessMiddleware } from "../../../middlewares/accessControl.middleware.js";
import { uploadFile } from "../../../middlewares/multer.middleware.js";
import { validate } from "../../../middlewares/zod.middleware.js";
import { getPagesValidator, managePagesValidator } from "./pages.validator.js";

const router = Router();

router.get(
  "/",
  publicApiLimiter,
  validate(getPagesValidator),
  getPagesController,
);
router.post(
  "/",
  protect,
  publicApiLimiter,
  accessMiddleware("pages"),
  ...uploadFile(),
  validate(managePagesValidator),
  managePagesController,
);

export default router;
