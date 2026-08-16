import { NextFunction, Request, Response } from "express";
import catchAsync from "../../../utils/catch.async.js";
import * as PagesSectionService from "./pagesSection.service.js";
import successResponse from "../../../utils/success.response.js";

export const getPagesSectionController = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await PagesSectionService.getPagesSectionService(req);
    return successResponse({
      res,
      ...result,
    });
  },
);

export const managePagesSectionController = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await PagesSectionService.managePagesSectionService(
      req,
      res,
    );
    return successResponse({
      res,
      ...result,
    });
  },
);

export const deletePagesSectionController = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await PagesSectionService.deletePagesSectionService(
      req,
      res,
    );
    return successResponse({
      res,
      ...result,
    });
  },
);
