import { NextFunction, Request, Response } from "express";
import catchAsync from "../../../utils/catch.async.js";
import successResponse from "../../../utils/success.response.js";
import * as CmsPageService from "./cmspage.service.js";
export const getCmsPageController = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await CmsPageService.getCmsPageService(req);
    return successResponse({
      res,
      ...result,
    });
  },
);

export const manageCmsPageController = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await CmsPageService.manageCmsPageService(req, res);
    return successResponse({
      res,
      ...result,
    });
  },
);

export const deleteCmsPageController = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await CmsPageService.deleteCmsPageService(req, res);
    return successResponse({
      res,
      ...result,
    });
  },
);
