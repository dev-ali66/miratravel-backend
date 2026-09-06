import { Request, Response } from "express";

import catchAsync from "../../../utils/catch.async.js";
import successResponse from "../../../utils/success.response.js";

import * as PaymentConfigService from "./paymentConfig.service.js";

export const getPaymentConfigController = catchAsync(
  async (req: Request, res: Response) => {
    const result = await PaymentConfigService.getPaymentConfigService(req);
    return successResponse({ res, ...result });
  },
);

export const upsertPaymentConfigController = catchAsync(
  async (req: Request, res: Response) => {
    const result = await PaymentConfigService.upsertPaymentConfigService(req);
    return successResponse({ res, ...result });
  },
);
