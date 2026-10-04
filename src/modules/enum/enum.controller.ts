import { NextFunction, Request, Response } from "express";
import catchAsync from "../../utils/catch.async.js";
import successResponse from "../../utils/success.response.js";
import * as EnumService from "./enum.service.js";

export const getEnumController = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await EnumService.getEnumService(req);
    return successResponse<any>({
      res,
      ...result,
    });
  }
);
