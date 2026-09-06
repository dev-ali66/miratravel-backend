import { Router } from "express";
import { protect } from "../../../middlewares/auth.middleware.js";
import { publicApiLimiter } from "../../../middlewares/limiter.middleware.js";
import {
  deleteCmsPageController,
  getCmsPageController,
  manageCmsPageController,
} from "./cmspage.controller.js";
import { accessMiddleware } from "../../../middlewares/accessControl.middleware.js";
import { uploadFile } from "../../../middlewares/multer.middleware.js";
import { validate } from "../../../middlewares/zod.middleware.js";
import {
  getCmsPageValidator,
  manageCmsPageValidator,
} from "./cmspage.validator.js";

const router = Router();

router.get(
  "/",
  publicApiLimiter,
  validate(getCmsPageValidator),
  getCmsPageController,
);
router.post(
  "/",
  protect,
  publicApiLimiter,
  accessMiddleware("CmsPage"),
  ...uploadFile(),
  validate(manageCmsPageValidator),
  manageCmsPageController,
);
router.delete(
  "/",
  protect,
  publicApiLimiter,
  ...uploadFile(),
  accessMiddleware("CmsPage"),
  deleteCmsPageController,
);

export default router;
