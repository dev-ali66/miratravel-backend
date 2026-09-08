import { Router } from "express";
import { protect } from "../../middlewares/auth.middleware.js";
import { publicApiLimiter } from "../../middlewares/limiter.middleware.js";
import { validate } from "../../middlewares/zod.middleware.js";
import {
  getUsersController,
  createUserController,
  updateUserController,
  deleteUserController,
} from "./users.controller.js";
import {
  getUsersValidator,
  createUpdateUserValidator,
} from "./users.validator.js";

const router = Router();

router.get(
  "/",
  protect,
  publicApiLimiter,
  validate(getUsersValidator),
  getUsersController,
);

router.post(
  "/",
  protect,
  publicApiLimiter,
  validate(createUpdateUserValidator),
  createUserController,
);

router.put(
  "/:id",
  protect,
  publicApiLimiter,
  validate(createUpdateUserValidator),
  updateUserController,
);

router.patch(
  "/:id",
  protect,
  publicApiLimiter,
  validate(createUpdateUserValidator),
  updateUserController,
);

router.patch(
  "/",
  protect,
  publicApiLimiter,
  validate(createUpdateUserValidator),
  updateUserController,
);

router.delete(
  "/:id",
  protect,
  publicApiLimiter,
  deleteUserController,
);

router.delete(
  "/",
  protect,
  publicApiLimiter,
  deleteUserController,
);

export default router;
