import { NextFunction, Request, Response } from "express";
import catchAsync from "../../utils/catch.async.js";
import successResponse from "../../utils/success.response.js";
import * as StoryTypeService from "./storyType.service.js";

export const getStoryTypesController = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await StoryTypeService.getStoryTypesService(req);
    return successResponse<any>({
      res,
      ...result,
    });
  },
);

export const createStoryTypeController = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await StoryTypeService.createStoryTypeService(req);
    return successResponse<any>({
      res,
      ...result,
    });
  },
);

export const deleteStoryTypeController = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await StoryTypeService.deleteStoryTypeService(req);
    return successResponse<any>({
      res,
      ...result,
    });
  },
);
