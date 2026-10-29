import { Request, Response, NextFunction } from "express";

import catchAsync from "../../../utils/catch.async.js";
import successResponse from "../../../utils/success.response.js";

import * as BookingService from "./booking.service.js";
import { downloadItineraryService } from "./itineraryDownload.service.js";

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

export const getSingleBookingController = catchAsync(
  async (req: Request, res: Response) => {
    const result = await BookingService.getSingleBookingService(req);
    return successResponse({ res, ...result });
  },
);

export const downloadItineraryController = catchAsync(
  async (req: Request, res: Response) => {
    const result = await downloadItineraryService(req);

    if (result.format === "json") {
      return successResponse({
        res,
        data: result.data,
        meta: { filename: result.filename },
        message: "Itinerary retrieved successfully",
      });
    }

    const disposition = req.query.inline === "true" ? "inline" : "attachment";
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.setHeader(
      "Content-Disposition",
      `${disposition}; filename="${result.filename}"`
    );
    return res.status(200).send(result.htmlContent);
  },
);
