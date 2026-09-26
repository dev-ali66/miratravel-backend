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
import { accessMiddleware } from "../../middlewares/accessControl.middleware.js";

const router = Router();

router.get(
  "/",
  protect,
  publicApiLimiter,
  accessMiddleware("Wishlist"),
  validate(getWishlistValidator),
  getWishlistController,
);

router.post(
  "/",
  protect,
  publicApiLimiter,
  accessMiddleware("Wishlist"),
  validate(manageWishlistValidator),
  manageWishlistController,
);

router.delete(
  "/",
  protect,
  publicApiLimiter,
  accessMiddleware("Wishlist"),
  deleteWishlistController,
);

export default router;
