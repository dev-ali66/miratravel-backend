import { Router } from "express";
import { protect } from "../../../middlewares/auth.middleware.js";
import { publicApiLimiter } from "../../../middlewares/limiter.middleware.js";
import {
  deleteRolesController,
  getRolesController,
  manageRolesController,
} from "./roles.controller.js";
import { accessMiddleware } from "../../../middlewares/accessControl.middleware.js";
import { uploadFile } from "../../../middlewares/multer.middleware.js";
import { validate } from "../../../middlewares/zod.middleware.js";
import { getrolesValidator, managerolesValidator } from "./roles.validator.js";

const router = Router();

router.get(
  "/",
  protect,
  publicApiLimiter,
  accessMiddleware("Roles"),
  validate(getrolesValidator),
  getRolesController,
);
router.post(
  "/",
  protect,
  publicApiLimiter,
  accessMiddleware("Roles"),
  ...uploadFile(["image", "video"], [10, 100], 10),
  validate(managerolesValidator),
  manageRolesController,
);
router.delete(
  "/",
  protect,
  publicApiLimiter,
  ...uploadFile(),
  accessMiddleware("Roles"),
  deleteRolesController,
);

export default router;
