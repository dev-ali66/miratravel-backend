import { NextFunction, Request, Response } from "express";

import catchAsync from "../../../utils/catch.async.js";
import successResponse from "../../../utils/success.response.js";

import * as CountryPageSectionService from "./countryPageSection.service.js";

export const getCountryPageSectionController = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result =
      await CountryPageSectionService.getCountryPageSectionService(req);

    return successResponse({
      res,
      ...result,
    });
  },
);

export const manageCountryPageSectionController = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result =
      await CountryPageSectionService.manageCountryPageSectionService(
        req,
        res,
      );

    return successResponse({
      res,
      ...result,
    });
  },
);

export const deleteCountryPageSectionController = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result =
      await CountryPageSectionService.deleteCountryPageSectionService(
        req,
        res,
      );

    return successResponse({
      res,
      ...result,
    });
  },
);