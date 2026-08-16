import { NextFunction, Request, Response } from "express";
import catchAsync from "../../../utils/catch.async.js";
import successResponse from "../../../utils/success.response.js";
import * as journeysPricingService from "../journeysPricing/journeysPricing.service.js";
export const getjourneysPricingController = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await journeysPricingService.getjourneysPricingService(req);
    return successResponse({
      res,
      ...result,
    });
  },
);

export const managejourneysPricingController = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await journeysPricingService.managejourneysPricingService(
      req,
      res,
    );
    return successResponse({
      res,
      ...result,
    });
  },
);

export const deletejourneysPricingController = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await journeysPricingService.deletejourneysPricingService(
      req,
      res,
    );
    return successResponse({
      res,
      ...result,
    });
  },
);
