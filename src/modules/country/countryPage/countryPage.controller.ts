import { NextFunction, Request, Response } from "express";

import catchAsync from "../../../utils/catch.async.js";
import successResponse from "../../../utils/success.response.js";

import * as CountryPageService from "./countryPage.service.js";

export const getCountryPageController = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await CountryPageService.getCountryPageService(req);

    return successResponse({
      res,
      ...result,
    });
  },
);

export const manageCountryPageController = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await CountryPageService.manageCountryPageService(req, res);

    return successResponse({
      res,
      ...result,
    });
  },
);

export const deleteCountryPageController = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await CountryPageService.deleteCountryPageService(req, res);

    return successResponse({
      res,
      ...result,
    });
  },
);
