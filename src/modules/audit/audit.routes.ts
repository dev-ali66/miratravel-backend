import { Router } from "express";
import { protect } from "../../middlewares/auth.middleware.js";
import { publicApiLimiter } from "../../middlewares/limiter.middleware.js";
import {
  getAuditLogsController,
  getAuditStatsController,
  getAuditLogByIdController,
  clearAuditLogsController,
  simulateAuditLogController,
} from "./audit.controller.js";

const router = Router();

// All routes in /api/v1/audit are protected
router.use(protect);

router.get("/", publicApiLimiter, getAuditLogsController);
router.get("/stats", publicApiLimiter, getAuditStatsController);
router.get("/:id", publicApiLimiter, getAuditLogByIdController);
router.post("/clear", publicApiLimiter, clearAuditLogsController);
router.post("/simulate", publicApiLimiter, simulateAuditLogController);

export default router;
