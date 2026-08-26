import { NextFunction, Request, Response } from "express";

import catchAsync from "../../../utils/catch.async.js";
import successResponse from "../../../utils/success.response.js";

import * as JourneyLocationService from "./journeyLocation.service.js";

export const getJourneyLocationController = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result =
      await JourneyLocationService.getJourneyLocationService(req);

    return successResponse({
      res,
      ...result,
    });
  },
);

export const manageJourneyLocationController = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result =
      await JourneyLocationService.manageJourneyLocationService(
        req,
        res,
      );

    return successResponse({
      res,
      ...result,
    });
  },
);

export const deleteJourneyLocationController = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result =
      await JourneyLocationService.deleteJourneyLocationService(
        req,
        res,
      );

    return successResponse({
      res,
      ...result,
    });
  },
);