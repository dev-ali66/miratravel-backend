import { NextFunction, Request, Response } from "express";
import catchAsync from "../../../utils/catch.async.js";
import successResponse from "../../../utils/success.response.js";
import * as journeysItineraryService from "./journeysItinerary.service.js";
export const getjourneysItineraryController = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result =
      await journeysItineraryService.getjourneysItineraryService(req);
    return successResponse({
      res,
      ...result,
    });
  },
);

export const managejourneysItineraryController = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result =
      await journeysItineraryService.managejourneysItineraryService(req, res);
    return successResponse({
      res,
      ...result,
    });
  },
);

export const deletejourneysItineraryController = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result =
      await journeysItineraryService.deletejourneysItineraryService(req, res);
    return successResponse({
      res,
      ...result,
    });
  },
);
