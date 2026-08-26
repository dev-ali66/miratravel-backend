import { NextFunction, Request, Response } from "express";

import catchAsync from "../../../utils/catch.async.js";
import successResponse from "../../../utils/success.response.js";

import * as journeyAccommodationService from "./journeyAccommodation.service.js";

export const getjourneyAccommodationController = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result =
      await journeyAccommodationService.getjourneyAccommodationService(req);

    return successResponse({
      res,
      ...result,
    });
  },
);

export const managejourneyAccommodationController = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result =
      await journeyAccommodationService.managejourneyAccommodationService(
        req,
        res,
      );

    return successResponse({
      res,
      ...result,
    });
  },
);

export const deletejourneyAccommodationController = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result =
      await journeyAccommodationService.deletejourneyAccommodationService(
        req,
        res,
      );

    return successResponse({
      res,
      ...result,
    });
  },
);