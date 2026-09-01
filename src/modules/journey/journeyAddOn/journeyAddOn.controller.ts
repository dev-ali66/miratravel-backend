import { NextFunction, Request, Response } from "express";

import catchAsync from "../../../utils/catch.async.js";
import successResponse from "../../../utils/success.response.js";

import * as JourneyAddOnService from "./journeyAddOn.service.js";

export const getJourneyAddOnController = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await JourneyAddOnService.getJourneyAddOnService(req);
    return successResponse({ res, ...result });
  },
);

export const manageJourneyAddOnController = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await JourneyAddOnService.manageJourneyAddOnService(
      req,
      res,
    );
    return successResponse({ res, ...result });
  },
);

export const deleteJourneyAddOnController = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await JourneyAddOnService.deleteJourneyAddOnService(
      req,
      res,
    );
    return successResponse({ res, ...result });
  },
);
