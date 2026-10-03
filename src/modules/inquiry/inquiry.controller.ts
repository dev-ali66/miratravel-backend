import { Request, Response } from "express";
import catchAsync from "../../utils/catch.async.js";
import successResponse from "../../utils/success.response.js";
import {
  createInquiry,
  getInquiries,
  updateInquiry,
  deleteInquiry,
} from "./inquiry.service.js";

export const createInquiryController = catchAsync(
  async (req: Request, res: Response) => {
    const result = await createInquiry(req.body);
    return successResponse<any>({
      res,
      message: "Your inquiry has been submitted successfully.",
      data: result,
      code: 201,
    });
  }
);

export const getInquiriesController = catchAsync(
  async (req: Request, res: Response) => {
    const result = await getInquiries(req.query);
    return successResponse<any>({
      res,
      message: "Inquiries retrieved successfully.",
      data: result.data,
      meta: {
        total: result.total,
        page: result.page,
        limit: result.limit,
      },
    });
  }
);

export const updateInquiryController = catchAsync(
  async (req: Request, res: Response) => {
    const id = String(req.params.id);
    const result = await updateInquiry(id, req.body);
    return successResponse<any>({
      res,
      message: "Inquiry updated successfully.",
      data: result,
    });
  }
);

export const deleteInquiryController = catchAsync(
  async (req: Request, res: Response) => {
    const id = String(req.params.id);
    await deleteInquiry(id);
    return successResponse<any>({
      res,
      message: "Inquiry deleted successfully.",
      data: null,
    });
  }
);
