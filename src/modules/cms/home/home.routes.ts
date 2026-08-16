import { Router } from "express";
import { protect } from "../../../middlewares/auth.middleware.js";
import { publicApiLimiter } from "../../../middlewares/limiter.middleware.js";

const router = Router();

router.post("/heading", protect, publicApiLimiter);
router.post("/journeys", protect, publicApiLimiter);
router.post("/destinations", protect, publicApiLimiter);
router.post("/why", protect, publicApiLimiter);
router.post("/experience", protect, publicApiLimiter);
