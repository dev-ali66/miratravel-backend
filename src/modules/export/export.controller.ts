import { NextFunction, Request, Response } from "express";
import catchAsync from "../../utils/catch.async.js";
import successResponse from "../../utils/success.response.js";
import * as ExportService from "./export.service.js";

const handleExportResponse = (res: Response, result: any, format?: string) => {
  if (format === "json") {
    return successResponse({
      res,
      data: result.data,
      meta: { total: result.count, filename: result.filename },
      message: "Data exported successfully",
    });
  }

  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="${result.filename}"`
  );
  return res.status(200).send(result.csvContent);
};

export const exportBookingsController = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await ExportService.exportBookingsService(req.query);
    return handleExportResponse(res, result, req.query.format as string);
  }
);

export const exportUsersController = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await ExportService.exportUsersService(req.query);
    return handleExportResponse(res, result, req.query.format as string);
  }
);

export const exportInquiriesController = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await ExportService.exportInquiriesService(req.query);
    return handleExportResponse(res, result, req.query.format as string);
  }
);

export const exportNewsletterController = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await ExportService.exportNewsletterService(req.query);
    return handleExportResponse(res, result, req.query.format as string);
  }
);

export const exportAuditLogsController = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await ExportService.exportAuditLogsService(req.query);
    return handleExportResponse(res, result, req.query.format as string);
  }
);

export const exportJourneyRequestsController = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await ExportService.exportJourneyRequestsService(req.query);
    return handleExportResponse(res, result, req.query.format as string);
  }
);
