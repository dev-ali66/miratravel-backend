import { Router } from "express";
import { protect } from "../../../middlewares/auth.middleware.js";
import { publicApiLimiter } from "../../../middlewares/limiter.middleware.js";
import {
  deletejourneysItineraryController,
  getjourneysItineraryController,
  managejourneysItineraryController,
} from "./journeysItinerary.controller.js";
import { accessMiddleware } from "../../../middlewares/accessControl.middleware.js";
import { uploadFile } from "../../../middlewares/multer.middleware.js";
import { validate } from "../../../middlewares/zod.middleware.js";
import {
  getjourneysItineraryValidator,
  managejourneysItineraryValidator,
} from "./journeysItinerary.validator.js";

const router = Router();

router.get(
  "/",
  publicApiLimiter,
  validate(getjourneysItineraryValidator),
  getjourneysItineraryController,
);
router.post(
  "/",
  protect,
  publicApiLimiter,
  accessMiddleware("journeysItinerary"),
  ...uploadFile(["image", "video"], [10, 100], 10),
  validate(managejourneysItineraryValidator),
  managejourneysItineraryController,
);
router.delete(
  "/",
  protect,
  publicApiLimiter,
  accessMiddleware("journeysItinerary"),
  deletejourneysItineraryController,
);

export default router;
