import { NextFunction, Request, Response } from "express";
import * as FileUploadService from "./fileUpload.service.js";
import catchAsync from "../../utils/catch.async.js";
import successResponse from "../../utils/success.response.js";

export const manageAllFileUploadController = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await FileUploadService.manageFileUploadService(req, res);
    return successResponse({
      res,
      ...result,
    });
  },
);
