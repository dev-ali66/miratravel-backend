import { z } from "zod";

export const createConciergeLeadValidator = z.object({
  body: z.object({
    firstName: z.string().min(1, "First name is required").max(50),
    lastName: z.string().min(1, "Last name is required").max(50),
    email: z.string().email("Valid email is required"),
    phone: z.string().optional(),
    partySize: z.number().int().min(1).max(100).optional(),
    travelStyle: z.enum([
      "CULTURE_HERITAGE",
      "NATURE",
      "ADVENTURE",
      "FOOD_WINE",
      "COASTAL_ESCAPE",
      "MOUNTAINS",
      "SLOW_TRAVEL",
      "LUXURY",
      "PHOTOGRAPHY",
      "WELLNESS",
    ]).optional(),
    budgetRange: z.enum([
      "UNDER_5K",
      "FROM_5K_TO_10K",
      "FROM_10K_TO_20K",
      "OVER_20K",
      "UNDECIDED",
    ]).optional(),
    specialRequests: z.string().max(2000).optional(),
  }),
});

export const updateConciergeLeadValidator = z.object({
  params: z.object({
    id: z.string().cuid("Invalid lead ID"),
  }),
  body: z.object({
    status: z.enum(["NEW", "IN_REVIEW", "ASSIGNED", "CLOSED"]).optional(),
    assignedToId: z.string().cuid("Invalid designer ID").optional().nullable(),
  }),
});

export const getConciergeLeadsValidator = z.object({
  query: z.object({
    status: z.enum(["NEW", "IN_REVIEW", "ASSIGNED", "CLOSED"]).optional(),
    assignedToId: z.string().optional(),
    page: z.string().regex(/^\d+$/).optional(),
    limit: z.string().regex(/^\d+$/).optional(),
  }),
});
