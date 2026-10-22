import { NextFunction, Request, Response } from "express";

import catchAsync from "../../utils/catch.async.js";
import successResponse from "../../utils/success.response.js";

import * as ExperienceService from "./experience.service.js";

export const getExperienceController = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await ExperienceService.getExperienceService(req);

    return successResponse({
      res,
      ...result,
    });
  },
);

export const searchExperienceOptionsController = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await ExperienceService.searchExperienceOptionsService(req);

    return successResponse({
      res,
      ...result,
    });
  },
);

export const manageExperienceController = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await ExperienceService.manageExperienceService(req, res);

    return successResponse({
      res,
      ...result,
    });
  },
);

export const deleteExperienceController = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await ExperienceService.deleteExperienceService(req, res);

    return successResponse({
      res,
      ...result,
    });
  },
);
