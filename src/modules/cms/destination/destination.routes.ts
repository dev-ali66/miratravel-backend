import { Router } from "express";
import { protect } from "../../../middlewares/auth.middleware.js";
import { publicApiLimiter } from "../../../middlewares/limiter.middleware.js";
import {
  deleteDestinationController,
  getDestinationController,
  manageDestinationController,
} from "./destination.controller.js";
import { accessMiddleware } from "../../../middlewares/accessControl.middleware.js";
import { uploadFile } from "../../../middlewares/multer.middleware.js";
import { validate } from "../../../middlewares/zod.middleware.js";
import {
  getDestinationValidator,
  manageDestinationValidator,
} from "./destination.validator.js";

const router = Router();

router.get(
  "/",
  publicApiLimiter,
  validate(getDestinationValidator),
  getDestinationController,
);
router.post(
  "/",
  protect,
  publicApiLimiter,
  accessMiddleware("destinations"),
  ...uploadFile(["image", "video"], [10, 100], 10),
  validate(manageDestinationValidator),
  manageDestinationController,
);
router.delete(
  "/",
  protect,
  publicApiLimiter,
  accessMiddleware("destinations"),
  ...uploadFile(),
  deleteDestinationController,
);

export default router;
