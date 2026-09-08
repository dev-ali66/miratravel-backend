import { Router } from "express";
import { protect } from "../../middlewares/auth.middleware.js";
import { publicApiLimiter } from "../../middlewares/limiter.middleware.js";
import {
  getSystemHealthController,
  getSystemInfoController,
  getDatabaseStatsController,
  getAuditLogsController,
  clearCacheController,
  getSystemConfigController,
  updateSystemConfigController,
  getFeatureFlagsController,
  updateFeatureFlagController,
  getSystemBackupsController,
  triggerSystemBackupController,
  getCronJobsController,
  runCronJobController,
  getSecurityStatsController,
  getBlockedIpsController,
  blockIpController,
  unblockIpController,
  getGatewaysStatusController,
} from "./system.controller.js";

const router = Router();

// Public / Diagnostic Telemetry endpoints
router.get("/health", publicApiLimiter, getSystemHealthController);
router.get("/info", publicApiLimiter, getSystemInfoController);
router.get("/gateways", publicApiLimiter, getGatewaysStatusController);

// Protected Admin / Governance endpoints
router.get("/db-stats", protect, publicApiLimiter, getDatabaseStatsController);
router.get("/audit-logs", protect, publicApiLimiter, getAuditLogsController);
router.post("/cache/clear", protect, publicApiLimiter, clearCacheController);

// System Configuration & Feature Flags
router.get("/config", protect, publicApiLimiter, getSystemConfigController);
router.put("/config", protect, publicApiLimiter, updateSystemConfigController);
router.get("/feature-flags", protect, publicApiLimiter, getFeatureFlagsController);
router.put("/feature-flags", protect, publicApiLimiter, updateFeatureFlagController);

// Database Snapshots & Backups
router.get("/backups", protect, publicApiLimiter, getSystemBackupsController);
router.post("/backups/trigger", protect, publicApiLimiter, triggerSystemBackupController);

// Cron Jobs & Scheduled Tasks
router.get("/cron-jobs", protect, publicApiLimiter, getCronJobsController);
router.post("/cron-jobs/:key/run", protect, publicApiLimiter, runCronJobController);

// Security & IP Blocklist
router.get("/security", protect, publicApiLimiter, getSecurityStatsController);
router.get("/security/blocked-ips", protect, publicApiLimiter, getBlockedIpsController);
router.post("/security/blocked-ips", protect, publicApiLimiter, blockIpController);
router.delete("/security/blocked-ips/:ip", protect, publicApiLimiter, unblockIpController);

export default router;
