import { Request, Response } from "express";
import catchAsync from "../../utils/catch.async.js";
import successResponse from "../../utils/success.response.js";
import {
  deleteWishlistService,
  getWishlistService,
  manageWishlistService,
} from "./wishlist.service.js";

export const getWishlistController = catchAsync(async (req: Request, res: Response) => {
  const result = await getWishlistService(req);
  return successResponse<any>({
    res,
    ...result,
  });
});

export const manageWishlistController = catchAsync(async (req: Request, res: Response) => {
  const result = await manageWishlistService(req, res);
  return successResponse<any>({
    res,
    ...result,
  });
});

export const deleteWishlistController = catchAsync(async (req: Request, res: Response) => {
  const result = await deleteWishlistService(req, res);
  return successResponse<any>({
    res,
    ...result,
  });
});
