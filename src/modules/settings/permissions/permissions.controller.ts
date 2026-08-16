import { NextFunction, Request, Response } from "express";
import catchAsync from "../../../utils/catch.async.js";
import successResponse from "../../../utils/success.response.js";
import * as PermissionsService from "./permissions.service.js";
export const getPermissionsController = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await PermissionsService.getPermissionsService(req);
    return successResponse({
      res,
      ...result,
    });
  },
);

export const managePermissionsController = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await PermissionsService.managePermissionsService(req, res);
    return successResponse({
      res,
      ...result,
    });
  },
);

export const deletePermissionsController = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await PermissionsService.deletePermissionsService(req, res);
    return successResponse({
      res,
      ...result,
    });
  },
);
