import { z } from "zod";

export const createInquiryValidator = z.object({
  body: z.object({
    fullName: z.string().min(1, "Full name is required").max(100),
    email: z.string().email("Valid email is required"),
    phone: z.string().optional().nullable(),
    destination: z.string().optional().nullable(),
    travelDate: z.string().optional().nullable(),
    travelers: z.string().optional().nullable(),
    journeyTypes: z.array(z.string()).optional().default([]),
    message: z.string().optional().nullable(),
  }),
});

export const updateInquiryValidator = z.object({
  params: z.object({
    id: z.string().min(1, "Invalid inquiry ID"),
  }),
  body: z.object({
    status: z.enum(["NEW", "IN_REVIEW", "CONTACTED", "CLOSED"]).optional(),
    adminNotes: z.string().optional().nullable(),
  }),
});

export const getInquiriesValidator = z.object({
  query: z.object({
    status: z.enum(["NEW", "IN_REVIEW", "CONTACTED", "CLOSED"]).optional(),
    search: z.string().optional(),
    page: z.string().regex(/^\d+$/).optional(),
    limit: z.string().regex(/^\d+$/).optional(),
  }),
});
