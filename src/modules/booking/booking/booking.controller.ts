import { Request, Response, NextFunction } from "express";

import catchAsync from "../../../utils/catch.async.js";
import successResponse from "../../../utils/success.response.js";

import * as BookingService from "./booking.service.js";

export const getBookingController = catchAsync(
  async (req: Request, res: Response) => {
    const result = await BookingService.getBookingService(req);
    return successResponse({ res, ...result });
  },
);

export const createBookingController = catchAsync(
  async (req: Request, res: Response) => {
    const result = await BookingService.createBookingRequestService(req);
    return successResponse({ res, ...result });
  },
);

export const updateBookingController = catchAsync(
  async (req: Request, res: Response) => {
    const result = await BookingService.updateBookingService(req);
    return successResponse({ res, ...result });
  },
);

export const approveBookingController = catchAsync(
  async (req: Request, res: Response) => {
    const result = await BookingService.approveBookingService(req);
    return successResponse({ res, ...result });
  },
);

export const rejectBookingController = catchAsync(
  async (req: Request, res: Response) => {
    const result = await BookingService.rejectBookingService(req);
    return successResponse({ res, ...result });
  },
);

export const cancelBookingController = catchAsync(
  async (req: Request, res: Response) => {
    const result = await BookingService.cancelBookingService(req);
    return successResponse({ res, ...result });
  },
);

export const reviseTotalController = catchAsync(
  async (req: Request, res: Response) => {
    const result = await BookingService.reviseBookingTotalService(req);
    return successResponse({ res, ...result });
  },
);

export const deleteBookingController = catchAsync(
  async (req: Request, res: Response) => {
    const result = await BookingService.deleteBookingService(req);
    return successResponse({ res, ...result });
  },
);
