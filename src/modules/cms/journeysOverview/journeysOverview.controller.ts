import { NextFunction, Request, Response } from "express";
import catchAsync from "../../../utils/catch.async.js";
import successResponse from "../../../utils/success.response.js";
import * as journeysOverviewService from "./journeysOverview.service.js";
export const getjourneysOverviewController = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result =
      await journeysOverviewService.getjourneysOverviewService(req);
    return successResponse({
      res,
      ...result,
    });
  },
);

export const managejourneysOverviewController = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await journeysOverviewService.managejourneysOverviewService(
      req,
      res,
    );
    return successResponse({
      res,
      ...result,
    });
  },
);

export const deletejourneysOverviewController = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await journeysOverviewService.deletejourneysOverviewService(
      req,
      res,
    );
    return successResponse({
      res,
      ...result,
    });
  },
);
