import { NextFunction, Request, Response } from "express";
import catchAsync from "../../../utils/catch.async.js";
import successResponse from "../../../utils/success.response.js";
import * as JourneysService from "./journeys.service.js";
export const getJourneysController = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await JourneysService.getJourneysService(req);
    return successResponse({
      res,
      ...result,
    });
  },
);

export const manageJourneysController = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await JourneysService.manageJourneysService(req, res);
    return successResponse({
      res,
      ...result,
    });
  },
);

export const deleteJourneysController = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await JourneysService.deleteJourneysService(req, res);
    return successResponse({
      res,
      ...result,
    });
  },
);
