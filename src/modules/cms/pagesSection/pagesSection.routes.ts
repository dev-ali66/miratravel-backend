import { Router } from "express";
import { protect } from "../../../middlewares/auth.middleware.js";
import { publicApiLimiter } from "../../../middlewares/limiter.middleware.js";
import { accessMiddleware } from "../../../middlewares/accessControl.middleware.js";
import { uploadFile } from "../../../middlewares/multer.middleware.js";
import { validate } from "../../../middlewares/zod.middleware.js";
import {
  getPagesSectionSchemaValidator,
  managePagesSectionSchemaValidator,
} from "./pagesSection.validator.js";
import {
  deletePagesSectionController,
  getPagesSectionController,
  managePagesSectionController,
} from "./pagesSection.controller.js";

const router = Router();
router.get(
  "/",
  publicApiLimiter,
  // accessMiddleware("beach"),
  validate(getPagesSectionSchemaValidator),
  getPagesSectionController,
);

router.post(
  "/",
  protect,
  publicApiLimiter,
  accessMiddleware("pagesSection"),
  ...uploadFile(["image", "video"], [5, 100], 10),
  validate(managePagesSectionSchemaValidator),
  managePagesSectionController,
);

router.delete(
  "/",
  protect,
  publicApiLimiter,
  ...uploadFile(),
  accessMiddleware("pagesSection"),
  deletePagesSectionController,
);


export default router;
