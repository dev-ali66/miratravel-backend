import { NextFunction, Request, Response } from "express";

import catchAsync from "../../../utils/catch.async.js";
import successResponse from "../../../utils/success.response.js";

import * as PlacePageSectionService from "./placePageSection.service.js";

export const getPlacePageSectionController = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result =
      await PlacePageSectionService.getPlacePageSectionService(req);

    return successResponse({
      res,
      ...result,
    });
  },
);

export const managePlacePageSectionController = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await PlacePageSectionService.managePlacePageSectionService(
      req,
      res,
    );

    return successResponse({
      res,
      ...result,
    });
  },
);

export const deletePlacePageSectionController = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await PlacePageSectionService.deletePlacePageSectionService(
      req,
      res,
    );

    return successResponse({
      res,
      ...result,
    });
  },
);
