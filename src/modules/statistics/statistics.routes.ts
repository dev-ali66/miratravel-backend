import { Router } from "express";
import { protect } from "../../middlewares/auth.middleware.js";
import { publicApiLimiter } from "../../middlewares/limiter.middleware.js";
import { getDashboardStatisticsController } from "./statistics.controller.js";

const router = Router();

router.get(
  "/",
  protect,
  publicApiLimiter,
  getDashboardStatisticsController,
);

router.get(
  "/overview",
  protect,
  publicApiLimiter,
  getDashboardStatisticsController,
);

export default router;
