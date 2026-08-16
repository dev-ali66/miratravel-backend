import { Router } from "express";
import { protect } from "../../../middlewares/auth.middleware.js";
import { publicApiLimiter } from "../../../middlewares/limiter.middleware.js";
import {
  deletejourneysIncludesController,
  getjourneysIncludesController,
  managejourneysIncludesController,
} from "./JourneysIncludes.controller.js";
import { accessMiddleware } from "../../../middlewares/accessControl.middleware.js";
import { uploadFile } from "../../../middlewares/multer.middleware.js";
import { validate } from "../../../middlewares/zod.middleware.js";
import {
  getjourneysIncludesValidator,
  managejourneysIncludesValidator,
} from "./JourneysIncludes.validator.js";

const router = Router();

router.get(
  "/",
  publicApiLimiter,
  validate(getjourneysIncludesValidator),
  getjourneysIncludesController,
);
router.post(
  "/",
  protect,
  publicApiLimiter,
  accessMiddleware("journeysIncludes"),
  ...uploadFile(["image", "video"], [10, 100], 10),
  validate(managejourneysIncludesValidator),
  managejourneysIncludesController,
);
router.delete(
  "/",
  protect,
  publicApiLimiter,
  accessMiddleware("journeysIncludes"),
  deletejourneysIncludesController,
);

export default router;
