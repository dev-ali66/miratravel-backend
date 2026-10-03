import catchAsync from "../../utils/catch.async.js";
import successResponse from "../../utils/success.response.js";
import * as newsletterService from "./newsletter.service.js";

export const subscribeNewsletterController = catchAsync(
  async (req: any, res: any) => {
    const result: any = await newsletterService.subscribeNewsletter(req, res);
    return successResponse({
      res,
      code: result?.code || 200,
      success: result?.success ?? true,
      message: result?.message || "Subscribed successfully",
      data: result?.data ?? result,
    });
  }
);

export const getNewsletterSubscribersController = catchAsync(
  async (req: any, res: any) => {
    const result: any = await newsletterService.getNewsletterSubscribers(req);
    return successResponse({
      res,
      code: result?.code || 200,
      success: result?.success ?? true,
      message: result?.message || "Subscribers retrieved successfully",
      meta: result?.meta || null,
      data: result?.data ?? result,
    });
  }
);

export const updateNewsletterSubscriberController = catchAsync(
  async (req: any, res: any) => {
    const result: any = await newsletterService.updateNewsletterSubscriber(req, res);
    return successResponse({
      res,
      code: result?.code || 200,
      success: result?.success ?? true,
      message: result?.message || "Subscriber updated successfully",
      data: result?.data ?? result,
    });
  }
);

export const deleteNewsletterSubscriberController = catchAsync(
  async (req: any, res: any) => {
    const result: any = await newsletterService.deleteNewsletterSubscriber(req, res);
    return successResponse({
      res,
      code: result?.code || 200,
      success: result?.success ?? true,
      message: result?.message || "Subscriber deleted successfully",
      data: result?.data ?? result,
    });
  }
);
