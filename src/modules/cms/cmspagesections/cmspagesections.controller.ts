import { NextFunction, Request, Response } from "express";
import catchAsync from "../../../utils/catch.async.js";
import successResponse from "../../../utils/success.response.js";
import * as CmsPageSectionsService from "./cmspagesections.service.js";
export const getCmsPageSectionsController = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await CmsPageSectionsService.getCmsPageSectionsService(req);
    return successResponse({
      res,
      ...result,
    });
  },
);

export const manageCmsPageSectionsController = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await CmsPageSectionsService.manageCmsPageSectionsService(
      req,
      res,
    );
    return successResponse({
      res,
      ...result,
    });
  },
);

export const deleteCmsPageSectionsController = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await CmsPageSectionsService.deleteCmsPageSectionsService(
      req,
      res,
    );
    return successResponse({
      res,
      ...result,
    });
  },
);
