import { NextFunction, Request, Response } from "express";
import catchAsync from "../../../utils/catch.async.js";
import successResponse from "../../../utils/success.response.js";
import * as journeysHeadingService from "./journeysHeading.service.js";
export const getjourneysHeadingController = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await journeysHeadingService.getjourneysHeadingService(req);
    return successResponse({
      res,
      ...result,
    });
  },
);

export const managejourneysHeadingController = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await journeysHeadingService.managejourneysHeadingService(
      req,
      res,
    );
    return successResponse({
      res,
      ...result,
    });
  },
);

export const deletejourneysHeadingController = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await journeysHeadingService.deletejourneysHeadingService(
      req,
      res,
    );
    return successResponse({
      res,
      ...result,
    });
  },
);
