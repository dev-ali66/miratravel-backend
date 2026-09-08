import { NextFunction, Request, Response } from "express";
import catchAsync from "../../utils/catch.async.js";
import successResponse from "../../utils/success.response.js";
import * as SystemService from "./system.service.js";

export const getSystemHealthController = catchAsync(
  async (req: Request, res: Response, _next: NextFunction) => {
    const result = await SystemService.getSystemHealthService(req);
    return successResponse({
      res,
      data: result,
      message: "System health telemetry retrieved successfully",
    });
  },
);

export const getSystemInfoController = catchAsync(
  async (req: Request, res: Response, _next: NextFunction) => {
    const result = await SystemService.getSystemInfoService(req);
    return successResponse({
      res,
      data: result,
      message: "System info retrieved successfully",
    });
  },
);

export const getDatabaseStatsController = catchAsync(
  async (req: Request, res: Response, _next: NextFunction) => {
    const result = await SystemService.getDatabaseStatsService(req);
    return successResponse({
      res,
      data: result,
      message: "Database telemetry statistics retrieved successfully",
    });
  },
);

export const getAuditLogsController = catchAsync(
  async (req: Request, res: Response, _next: NextFunction) => {
    const result = await SystemService.getAuditLogsService(req);
    return successResponse({
      res,
      data: result.data,
      meta: result.meta,
      message: "System audit logs retrieved successfully",
    });
  },
);

export const clearCacheController = catchAsync(
  async (req: Request, res: Response, _next: NextFunction) => {
    const result = await SystemService.clearCacheService(req);
    return successResponse({
      res,
      data: result,
      message: "Cache flushed successfully",
    });
  },
);

export const getSystemConfigController = catchAsync(
  async (_req: Request, res: Response, _next: NextFunction) => {
    const result = await SystemService.getSystemConfigService();
    return successResponse({
      res,
      data: result,
      message: "System configuration retrieved successfully",
    });
  },
);

export const updateSystemConfigController = catchAsync(
  async (req: Request, res: Response, _next: NextFunction) => {
    const result = await SystemService.updateSystemConfigService(req);
    return successResponse({
      res,
      data: result,
      message: "System configuration updated successfully",
    });
  },
);

export const getFeatureFlagsController = catchAsync(
  async (_req: Request, res: Response, _next: NextFunction) => {
    const result = await SystemService.getFeatureFlagsService();
    return successResponse({
      res,
      data: result,
      message: "Feature flags retrieved successfully",
    });
  },
);

export const updateFeatureFlagController = catchAsync(
  async (req: Request, res: Response, _next: NextFunction) => {
    const result = await SystemService.updateFeatureFlagService(req);
    return successResponse({
      res,
      data: result,
      message: "Feature flag updated successfully",
    });
  },
);

export const getSystemBackupsController = catchAsync(
  async (_req: Request, res: Response, _next: NextFunction) => {
    const result = await SystemService.getSystemBackupsService();
    return successResponse({
      res,
      data: result,
      message: "Database snapshot history retrieved successfully",
    });
  },
);

export const triggerSystemBackupController = catchAsync(
  async (req: Request, res: Response, _next: NextFunction) => {
    const result = await SystemService.triggerSystemBackupService(req);
    return successResponse({
      res,
      data: result,
      message: "Database backup initiated and completed successfully",
    });
  },
);

export const getCronJobsController = catchAsync(
  async (_req: Request, res: Response, _next: NextFunction) => {
    const result = await SystemService.getCronJobsService();
    return successResponse({
      res,
      data: result,
      message: "Scheduled cron jobs retrieved successfully",
    });
  },
);

export const runCronJobController = catchAsync(
  async (req: Request, res: Response, _next: NextFunction) => {
    const result = await SystemService.runCronJobService(req);
    return successResponse({
      res,
      data: result,
      message: "Cron job executed successfully",
    });
  },
);

export const getSecurityStatsController = catchAsync(
  async (_req: Request, res: Response, _next: NextFunction) => {
    const result = await SystemService.getSecurityStatsService();
    return successResponse({
      res,
      data: result,
      message: "Security sentinel telemetry retrieved successfully",
    });
  },
);

export const getBlockedIpsController = catchAsync(
  async (_req: Request, res: Response, _next: NextFunction) => {
    const result = await SystemService.getBlockedIpsService();
    return successResponse({
      res,
      data: result,
      message: "IP blocklist retrieved successfully",
    });
  },
);

export const blockIpController = catchAsync(
  async (req: Request, res: Response, _next: NextFunction) => {
    const result = await SystemService.blockIpService(req);
    return successResponse({
      res,
      data: result,
      message: "IP address blocked successfully",
    });
  },
);

export const unblockIpController = catchAsync(
  async (req: Request, res: Response, _next: NextFunction) => {
    const result = await SystemService.unblockIpService(req);
    return successResponse({
      res,
      data: result,
      message: "IP address unblocked successfully",
    });
  },
);

export const getGatewaysStatusController = catchAsync(
  async (_req: Request, res: Response, _next: NextFunction) => {
    const result = await SystemService.getGatewaysStatusService();
    return successResponse({
      res,
      data: result,
      message: "Third-party gateway health retrieved successfully",
    });
  },
);
