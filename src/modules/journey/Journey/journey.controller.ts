import { NextFunction, Request, Response } from "express";

import catchAsync from "../../../utils/catch.async.js";
import successResponse from "../../../utils/success.response.js";

import * as JourneyService from "./journey.service.js";

export const getJourneyController = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await JourneyService.getJourneyService(req);
    return successResponse({ res, ...result });
  },
);

export const manageJourneyController = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await JourneyService.manageJourneyService(req, res);
    return successResponse({ res, ...result });
  },
);

export const deleteJourneyController = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await JourneyService.deleteJourneyService(req, res);
    return successResponse({ res, ...result });
  },
);
