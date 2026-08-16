import { NextFunction, Request, Response } from "express";
import catchAsync from "../../../utils/catch.async.js";
import successResponse from "../../../utils/success.response.js";
import * as PagesService from "./pages.service.js";
export const getPagesController = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await PagesService.getPagesService(req);
    return successResponse({
      res,
      ...result,
    });
  },
);

export const managePagesController = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await PagesService.managePagesService(req, res);
    return successResponse({
      res,
      ...result,
    });
  },
);

export const deletePagesController = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await PagesService.deletePagesService(req, res);
    return successResponse({
      res,
      ...result,
    });
  },
);
