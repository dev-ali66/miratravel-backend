import { Request, Response } from "express";

import catchAsync from "../../../utils/catch.async.js";
import successResponse from "../../../utils/success.response.js";

import * as PaymentRecordService from "./paymentRecord.service.js";

export const getPaymentRecordController = catchAsync(
  async (req: Request, res: Response) => {
    const result = await PaymentRecordService.getPaymentRecordService(req);
    return successResponse({ res, ...result });
  },
);

export const recordPaymentController = catchAsync(
  async (req: Request, res: Response) => {
    const result = await PaymentRecordService.recordPaymentService(req);
    return successResponse({ res, ...result });
  },
);

export const refundPaymentController = catchAsync(
  async (req: Request, res: Response) => {
    const result = await PaymentRecordService.refundPaymentService(req);
    return successResponse({ res, ...result });
  },
);
