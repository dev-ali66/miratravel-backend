import { Router } from "express";
import { publicApiLimiter } from "../../middlewares/limiter.middleware.js";
import { validate } from "../../middlewares/zod.middleware.js";
import { getEnumController } from "./enum.controller.js";
import { getEnumValidator } from "./enum.validator.js";

const router = Router();

router.get(
  "/",
  publicApiLimiter,
  validate(getEnumValidator),
  getEnumController
);

export default router;
