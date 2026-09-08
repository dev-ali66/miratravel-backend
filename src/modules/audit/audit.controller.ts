import { NextFunction, Request, Response } from "express";
import catchAsync from "../../utils/catch.async.js";
import successResponse from "../../utils/success.response.js";
import { AuditService } from "./audit.service.js";

export const getAuditLogsController = catchAsync(
  async (req: Request, res: Response, _next: NextFunction) => {
    const { search, action, entity, status, limit, page } = req.query;
    const result = AuditService.getLogs({
      search: search as string,
      action: action as string,
      entity: entity as string,
      status: status as string,
      limit: limit ? Number(limit) : 50,
      page: page ? Number(page) : 1,
    });

    return successResponse({
      res,
      data: result.data,
      meta: result.meta,
      message: "Audit logs retrieved successfully",
    });
  }
);

export const getAuditStatsController = catchAsync(
  async (_req: Request, res: Response, _next: NextFunction) => {
    const stats = AuditService.getStats();
    return successResponse({
      res,
      data: stats,
      message: "Audit statistics retrieved successfully",
    });
  }
);

export const getAuditLogByIdController = catchAsync(
  async (req: Request, res: Response, _next: NextFunction) => {
    const { id } = req.params;
    const log = AuditService.getLogById(id as string);

    return successResponse({
      res,
      data: log,
      message: log ? "Audit log retrieved successfully" : "Audit log not found",
    });
  }
);

export const clearAuditLogsController = catchAsync(
  async (_req: Request, res: Response, _next: NextFunction) => {
    const result = AuditService.clearLogs();
    return successResponse({
      res,
      data: result,
      message: "Audit logs buffer cleared successfully",
    });
  }
);

export const simulateAuditLogController = catchAsync(
  async (req: Request, res: Response, _next: NextFunction) => {
    const { action, entityType, entityId, details, status } = req.body;

    const user: any = (req as any).auth || (req as any).user || {
      id: "admin_sim",
      email: "admin@dev.com",
      name: "Admin User",
      role: "ADMIN",
    };

    const record = AuditService.recordLog({
      actorName: user.name || "Admin User",
      actorEmail: user.email || "admin@dev.com",
      actorRole: user.role || user.roles || "ADMIN",
      action: action || "TEST_SIMULATED_EVENT",
      entityType: entityType || "Simulation",
      entityId: entityId || `sim_${Date.now()}`,
      status: status || "SUCCESS",
      ipAddress: req.ip || "127.0.0.1",
      details: details || "Simulated live audit event dispatched via admin console.",
      method: req.method,
      path: req.originalUrl,
    });

    return successResponse({
      res,
      data: record,
      message: "Simulated audit event logged and broadcasted successfully",
    });
  }
);
