import { NextFunction, Request, Response } from "express";

import catchAsync from "../../../utils/catch.async.js";
import successResponse from "../../../utils/success.response.js";

import * as PlacePageService from "./placePage.service.js";

export const getPlacePageController = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await PlacePageService.getPlacePageService(req);

    return successResponse({
      res,
      ...result,
    });
  },
);

export const managePlacePageController = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await PlacePageService.managePlacePageService(req, res);

    return successResponse({
      res,
      ...result,
    });
  },
);

export const deletePlacePageController = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await PlacePageService.deletePlacePageService(req, res);

    return successResponse({
      res,
      ...result,
    });
  },
);
