import { NextFunction, Request, Response } from "express";

import catchAsync from "../../../utils/catch.async.js";
import successResponse from "../../../utils/success.response.js";

import * as RegionPageService from "./regionPage.service.js";

export const getRegionPageController = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await RegionPageService.getRegionPageService(req);

    return successResponse({
      res,
      ...result,
    });
  },
);

export const manageRegionPageController = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await RegionPageService.manageRegionPageService(req, res);

    return successResponse({
      res,
      ...result,
    });
  },
);

export const deleteRegionPageController = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await RegionPageService.deleteRegionPageService(req, res);

    return successResponse({
      res,
      ...result,
    });
  },
);
