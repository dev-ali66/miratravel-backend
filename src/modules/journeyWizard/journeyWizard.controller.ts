import { NextFunction, Request, Response } from "express";
import catchAsync from "../../utils/catch.async.js";
import successResponse from "../../utils/success.response.js";
import * as wizardService from "./journeyWizard.service.js";

export const createJourneyWizardRequestController = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await wizardService.createJourneyWizardRequest(req, res);
    return successResponse<any>({
      res,
      ...result,
      message: "Journey wizard request submitted successfully",
    });
  }
);

export const getJourneyWizardRequestsController = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await wizardService.getJourneyWizardRequests(req);
    return successResponse<any>({
      res,
      ...result,
    });
  }
);

export const updateJourneyWizardRequestController = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await wizardService.updateJourneyWizardRequest(req, res);
    return successResponse<any>({
      res,
      ...result,
      message: "Journey wizard request updated successfully",
    });
  }
);

export const deleteJourneyWizardRequestController = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await wizardService.deleteJourneyWizardRequest(req, res);
    return successResponse<any>({
      res,
      ...result,
      message: "Journey wizard request deleted successfully",
    });
  }
);
