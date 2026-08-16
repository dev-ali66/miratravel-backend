import { NextFunction, Request, Response } from "express";
import catchAsync from "../../../utils/catch.async.js";
import successResponse from "../../../utils/success.response.js";
import * as journeysIncludesService from "./JourneysIncludes.service.js";
export const getjourneysIncludesController = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result =
      await journeysIncludesService.getjourneysIncludesService(req);
    return successResponse({
      res,
      ...result,
    });
  },
);

export const managejourneysIncludesController = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await journeysIncludesService.managejourneysIncludesService(
      req,
      res,
    );
    return successResponse({
      res,
      ...result,
    });
  },
);

export const deletejourneysIncludesController = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await journeysIncludesService.deletejourneysIncludesService(
      req,
      res,
    );
    return successResponse({
      res,
      ...result,
    });
  },
);
