import { Router } from "express";
import {
  getWishlistValidator,
  manageWishlistValidator,
} from "./wishList.validator.js";
import { publicApiLimiter } from "../../middlewares/limiter.middleware.js";
import { validate } from "../../middlewares/zod.middleware.js";
import { protect } from "../../middlewares/auth.middleware.js";
import { accessMiddleware } from "../../middlewares/accessControl.middleware.js";
import {
  deleteWishlistController,
  getWishlistController,
  manageWishlistController,
} from "./wishList.controller.js";
import { uploadFile } from "../../middlewares/multer.middleware.js";

const router = Router();

router.get(
  "/",
  protect,
  publicApiLimiter,
  accessMiddleware("wishlist"),
  getWishlistController,
);
router.post(
  "/",
  protect,
  publicApiLimiter,
  ...uploadFile(),
  accessMiddleware("wishlist"),
  validate(manageWishlistValidator),
  manageWishlistController,
);
router.delete(
  "/",
  protect,
  publicApiLimiter,
  ...uploadFile(),
  accessMiddleware("wishlist"),
  deleteWishlistController,
);

export default router;
