import { NextFunction, Request, Response } from "express";
import catchAsync from "../../../utils/catch.async.js";
import successResponse from "../../../utils/success.response.js";
import * as DestinationService from "./destination.service.js";
export const getDestinationController = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await DestinationService.getDestinationService(req);
    return successResponse({
      res,
      ...result,
    });
  },
);

export const manageDestinationController = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await DestinationService.manageDestinationService(req, res);
    return successResponse({
      res,
      ...result,
    });
  },
);

export const deleteDestinationController = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await DestinationService.deleteDestinationService(req, res);
    return successResponse({
      res,
      ...result,
    });
  },
);
