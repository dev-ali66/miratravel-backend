import { NextFunction, Request, Response } from "express";
import catchAsync from "../../utils/catch.async.js";
import successResponse from "../../utils/success.response.js";
import * as StoryService from "./story.service.js";

export const getStoryController = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await StoryService.getStoryService(req);
    return successResponse<any>({
      res,
      ...result,
    });
  },
);

export const manageStoryController = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await StoryService.manageStoryService(req, res);
    return successResponse<any>({
      res,
      ...result,
    });
  },
);

export const deleteStoryController = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await StoryService.deleteStoryService(req, res);
    return successResponse<any>({
      res,
      ...result,
    });
  },
);
