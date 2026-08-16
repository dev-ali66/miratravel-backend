import { Router } from "express";
import { protect } from "../../../middlewares/auth.middleware.js";
import { publicApiLimiter } from "../../../middlewares/limiter.middleware.js";
import {
  deletePermissionsController,
  getPermissionsController,
  managePermissionsController,
} from "./permissions.controller.js";
import { accessMiddleware } from "../../../middlewares/accessControl.middleware.js";
import { uploadFile } from "../../../middlewares/multer.middleware.js";
import { validate } from "../../../middlewares/zod.middleware.js";
import { getPermissionsValidator, managePermissionsValidator } from "./permissions.validator.js";

const router = Router();

router.get(
  "/",
  protect,
  publicApiLimiter,
  accessMiddleware("Permissions"),
  validate(getPermissionsValidator),
  getPermissionsController,
);
router.post(
  "/",
  protect,
  publicApiLimiter,
  accessMiddleware("Permissions"),
  ...uploadFile(["image", "video"], [10, 100], 10),
  validate(managePermissionsValidator),
  managePermissionsController,
);
router.delete(
  "/",
  protect,
  publicApiLimiter,
  ...uploadFile(),
  accessMiddleware("Permissions"),
  deletePermissionsController,
);

export default router;
