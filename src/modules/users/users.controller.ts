import { NextFunction, Request, Response } from "express";
import catchAsync from "../../utils/catch.async.js";
import successResponse from "../../utils/success.response.js";
import * as UserService from "./users.service.js";

export const getUsersController = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await UserService.getUsersService(req);
    return successResponse({
      res,
      data: result.data,
      meta: (result as any).meta,
      message: "Users retrieved successfully",
    });
  },
);

export const createUserController = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await UserService.createUserService(req);
    return successResponse({
      res,
      code: 201,
      data: result.data,
      message: result.message,
    });
  },
);

export const updateUserController = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await UserService.updateUserService(req);
    return successResponse({
      res,
      data: result.data,
      message: result.message,
    });
  },
);

export const deleteUserController = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await UserService.deleteUserService(req);
    return successResponse({
      res,
      data: result.data,
      message: result.message,
    });
  },
);
