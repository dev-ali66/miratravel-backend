import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import * as conciergeService from "./concierge.service.js";

export const createConciergeLeadController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const lead = await conciergeService.createConciergeLead(req.body);
    res.status(StatusCodes.CREATED).json({
      success: true,
      message: "Concierge lead created successfully",
      data: lead,
    });
  } catch (error) {
    next(error);
  }
};

export const getConciergeLeadsController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await conciergeService.getConciergeLeads(req.query);
    res.status(StatusCodes.OK).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const updateConciergeLeadController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const lead = await conciergeService.updateConciergeLead(
      req.params.id as string,
      req.body
    );
    res.status(StatusCodes.OK).json({
      success: true,
      message: "Concierge lead updated successfully",
      data: lead,
    });
  } catch (error) {
    next(error);
  }
};
