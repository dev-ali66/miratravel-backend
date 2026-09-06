import { z } from "zod";

export const getPaymentRecordValidator = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().optional(),
    limit: z.coerce.number().int().positive().max(100).optional(),
    id: z.string().trim().optional(),
    bookingId: z.string().trim().optional(),
    scheduleItemId: z.string().trim().optional(),
    status: z
      .enum([
        "SUCCEEDED",
        "FAILED",
        "PENDING",
        "REFUNDED",
        "PARTIALLY_REFUNDED",
      ])
      .optional(),
  }),
});

// Covers both admin "mark manually received" (spec §10) and a PSP callback recording a transaction.
export const recordPaymentValidator = z.object({
  body: z.object({
    bookingId: z.string().trim().min(1),
    scheduleItemId: z.string().trim().optional(), // defaults to the next unpaid item
    amount: z.coerce.number().positive(),
    currency: z.string().trim().length(3).optional(),
    method: z.string().trim().optional(), // e.g. "manual", "mollie", "bank_transfer"
    pspTransactionRef: z.string().trim().optional(),
    status: z.enum(["SUCCEEDED", "FAILED", "PENDING"]).default("SUCCEEDED"),
    paymentDate: z.coerce.date().optional(),
    adminNotes: z.string().trim().optional(),
  }),
});

export const refundPaymentValidator = z.object({
  params: z.object({ id: z.string().trim().min(1) }),
  body: z.object({
    refundAmount: z.coerce.number().positive(),
    adminNotes: z.string().trim().min(1),
  }),
});
