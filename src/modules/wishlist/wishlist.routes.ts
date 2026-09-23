import { Router } from "express";
import { protect } from "../../middlewares/auth.middleware.js";
import { publicApiLimiter } from "../../middlewares/limiter.middleware.js";
import { validate } from "../../middlewares/zod.middleware.js";
import {
  deleteWishlistController,
  getWishlistController,
  manageWishlistController,
} from "./wishlist.controller.js";
import {
  getWishlistValidator,
  manageWishlistValidator,
} from "./wishlist.validator.js";

const router = Router();

router.get(
  "/",
  protect,
  publicApiLimiter,
  validate(getWishlistValidator),
  getWishlistController,
);

router.post(
  "/",
  protect,
  publicApiLimiter,
  validate(manageWishlistValidator),
  manageWishlistController,
);

router.delete(
  "/",
  protect,
  publicApiLimiter,
  deleteWishlistController,
);

export default router;
