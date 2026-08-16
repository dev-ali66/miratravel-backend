import { NextFunction, Request, Response } from "express";
import * as WishlistService from "./wishList.service.js";
import successResponse from "../../utils/success.response.js";
import catchAsync from "../../utils/catch.async.js";
export const getWishlistController = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await WishlistService.getWishlistService(req);
    return successResponse({
      res,
      ...result,
    });
  },
);

export const manageWishlistController = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await WishlistService.manageWishlistService(req, res);
    return successResponse({
      res,
      ...result,
    });
  },
);

export const deleteWishlistController = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await WishlistService.deleteWishlistService(req, res);
    return successResponse({
      res,
      ...result,
    });
  },
);
