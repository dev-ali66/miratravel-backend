import { NextFunction, Request, Response } from "express";
import catchAsync from "../../utils/catch.async.js";
import successResponse from "../../utils/success.response.js";
import * as StatisticsService from "./statistics.service.js";

export const getDashboardStatisticsController = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await StatisticsService.getDashboardStatisticsService(req);
    return successResponse({
      res,
      data: result,
      message: "Dashboard statistics retrieved successfully",
    });
  },
);
