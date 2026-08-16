import { Router } from "express";
import { protect } from "../../../middlewares/auth.middleware.js";
import { publicApiLimiter } from "../../../middlewares/limiter.middleware.js";
import {
  deleteJourneysController,
  getJourneysController,
  manageJourneysController,
} from "./journeys.controller.js";
import { accessMiddleware } from "../../../middlewares/accessControl.middleware.js";
import { uploadFile } from "../../../middlewares/multer.middleware.js";
import { validate } from "../../../middlewares/zod.middleware.js";
import {
  getJourneysValidator,
  manageJourneysValidator,
} from "./journeys.validator.js";

const router = Router();

router.get(
  "/",
  publicApiLimiter,
  validate(getJourneysValidator),
  getJourneysController,
);
router.post(
  "/",
  protect,
  publicApiLimiter,
  accessMiddleware("journeys"),
  ...uploadFile(["image", "video"], [10, 100], 10),
  validate(manageJourneysValidator),
  manageJourneysController,
);
router.delete(
  "/",
  protect,
  publicApiLimiter,
  accessMiddleware("journeys"),
  deleteJourneysController,
);

export default router;
