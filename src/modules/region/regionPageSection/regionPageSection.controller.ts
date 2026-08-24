import { NextFunction, Request, Response } from "express";

import catchAsync from "../../../utils/catch.async.js";
import successResponse from "../../../utils/success.response.js";

import * as RegionPageSectionService from "./regionPageSection.service.js";

export const getRegionPageSectionController = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result =
      await RegionPageSectionService.getRegionPageSectionService(req);

    return successResponse({
      res,
      ...result,
    });
  },
);

export const manageRegionPageSectionController = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result =
      await RegionPageSectionService.manageRegionPageSectionService(
        req,
        res,
      );

    return successResponse({
      res,
      ...result,
    });
  },
);

export const deleteRegionPageSectionController = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result =
      await RegionPageSectionService.deleteRegionPageSectionService(
        req,
        res,
      );

    return successResponse({
      res,
      ...result,
    });
  },
);