import { NextFunction, Request, Response } from "express";

import catchAsync from "../../../utils/catch.async.js";
import successResponse from "../../../utils/success.response.js";

import * as JourneyItineraryService from "./journeyItinerary.service.js";

export const getJourneyItineraryController = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result =
      await JourneyItineraryService.getJourneyItineraryService(req);

    return successResponse({
      res,
      ...result,
    });
  },
);

export const manageJourneyItineraryController = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result =
      await JourneyItineraryService.manageJourneyItineraryService(
        req,
        res,
      );

    return successResponse({
      res,
      ...result,
    });
  },
);

export const deleteJourneyItineraryController = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result =
      await JourneyItineraryService.deleteJourneyItineraryService(
        req,
        res,
      );

    return successResponse({
      res,
      ...result,
    });
  },
);