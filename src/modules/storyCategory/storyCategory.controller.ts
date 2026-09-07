import { NextFunction, Request, Response } from "express";
import catchAsync from "../../utils/catch.async.js";
import successResponse from "../../utils/success.response.js";
import * as StoryCategoryService from "./storyCategory.service.js";

export const getStoryCategoriesController = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await StoryCategoryService.getStoryCategoriesService(req);
    return successResponse<any>({
      res,
      ...result,
    });
  },
);

export const createStoryCategoryController = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await StoryCategoryService.createStoryCategoryService(req);
    return successResponse<any>({
      res,
      ...result,
    });
  },
);

export const deleteStoryCategoryController = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await StoryCategoryService.deleteStoryCategoryService(req);
    return successResponse<any>({
      res,
      ...result,
    });
  },
);
