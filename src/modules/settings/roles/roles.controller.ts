import { NextFunction, Request, Response } from "express";
import catchAsync from "../../../utils/catch.async.js";
import successResponse from "../../../utils/success.response.js";
import * as RolesService from "./roles.service.js";
export const getRolesController = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await RolesService.getRolesService(req);
    return successResponse({
      res,
      ...result,
    });
  },
);

export const manageRolesController = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await RolesService.manageRolesService(req, res);
    return successResponse({
      res,
      ...result,
    });
  },
);

export const deleteRolesController = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await RolesService.deleteRolesService(req, res);
    return successResponse({
      res,
      ...result,
    });
  },
);
