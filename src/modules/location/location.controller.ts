import { NextFunction, Request, Response } from "express";

import catchAsync from "../../utils/catch.async.js";
import successResponse from "../../utils/success.response.js";

import * as LocationService from "./location.service.js";

export const getLocationController = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await LocationService.getLocationService(req);

    return successResponse({
      res,
      ...result,
    });
  },
);

export const manageLocationController = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await LocationService.manageLocationService(req, res);

    return successResponse({
      res,
      ...result,
    });
  },
);

export const deleteLocationController = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await LocationService.deleteLocationService(req, res);

    return successResponse({
      res,
      ...result,
    });
  },
);