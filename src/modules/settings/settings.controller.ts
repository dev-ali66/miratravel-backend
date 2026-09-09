import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import * as settingsService from "./settings.service.js";

export const getSiteSettingsController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const settings = await settingsService.getSiteSettings();
    res.status(StatusCodes.OK).json({
      success: true,
      data: settings,
    });
  } catch (error) {
    next(error);
  }
};

export const updateSiteSettingsController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const settings = await settingsService.updateSiteSettings(req.body);
    res.status(StatusCodes.OK).json({
      success: true,
      message: "Site settings updated successfully",
      data: settings,
    });
  } catch (error) {
    next(error);
  }
};
