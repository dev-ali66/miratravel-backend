import { Request, Response } from "express";

import catchAsync from "../../../utils/catch.async.js";
import successResponse from "../../../utils/success.response.js";

import * as PaymentScheduleService from "./paymentSchedule.service.js";

export const getPaymentScheduleController = catchAsync(
  async (req: Request, res: Response) => {
    const result = await PaymentScheduleService.getPaymentScheduleService(req);
    return successResponse({ res, ...result });
  },
);

export const overrideScheduleController = catchAsync(
  async (req: Request, res: Response) => {
    const result =
      await PaymentScheduleService.overridePaymentScheduleService(req);
    return successResponse({ res, ...result });
  },
);

export const waiveScheduleItemController = catchAsync(
  async (req: Request, res: Response) => {
    const result = await PaymentScheduleService.waiveScheduleItemService(req);
    return successResponse({ res, ...result });
  },
);

export const sendPaymentRequestController = catchAsync(
  async (req: Request, res: Response) => {
    const result = await PaymentScheduleService.sendPaymentRequestService(req);
    return successResponse({ res, ...result });
  },
);

export const dueOverviewController = catchAsync(
  async (req: Request, res: Response) => {
    const result = await PaymentScheduleService.getDueOverviewService(req);
    return successResponse({ res, ...result });
  },
);
