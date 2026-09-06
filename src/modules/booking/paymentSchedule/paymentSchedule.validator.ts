import { z } from "zod";

export const getPaymentScheduleValidator = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().optional(),
    limit: z.coerce.number().int().positive().max(100).optional(),
    id: z.string().trim().optional(),
    bookingId: z.string().trim().optional(),
    status: z.enum(["ACTIVE", "SUPERSEDED", "CANCELLED"]).optional(),
  }),
});

const manualScheduleItemValidator = z.object({
  label: z.string().trim().min(1),
  calculationType: z.enum(["PERCENTAGE", "FIXED", "REMAINDER"]),
  ruleValue: z.coerce.number().nonnegative().optional(),
  dueRule: z.enum([
    "IMMEDIATE_AFTER_APPROVAL",
    "DAYS_BEFORE_DEPARTURE",
    "FIXED_DATE",
    "MANUAL",
  ]),
  dueValue: z.coerce.number().int().nonnegative().optional(),
  fixedDate: z.coerce.date().optional(),
});

export const overrideScheduleValidator = z.object({
  body: z.object({
    bookingId: z.string().trim().min(1),
    overrideReason: z.string().trim().min(1),
    items: z.array(manualScheduleItemValidator).min(1),
  }),
});

export const waiveScheduleItemValidator = z.object({
  params: z.object({ itemId: z.string().trim().min(1) }),
  body: z.object({ reason: z.string().trim().min(1) }),
});

export const sendPaymentRequestValidator = z.object({
  body: z.object({
    bookingId: z.string().trim().min(1),
    scheduleItemId: z.string().trim().optional(), // defaults to the next unpaid item in sequence
  }),
});

export const dueOverviewValidator = z.object({
  query: z.object({
    dueBefore: z.coerce.date().optional(), // defaults to "now" (overdue) when omitted
    withinDays: z.coerce.number().int().positive().optional(), // "due soon" window
  }),
});
