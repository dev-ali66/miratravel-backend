import { z } from "zod";

export const createJourneyWizardRequestValidator = z.object({
  body: z.object({
    journeyTypes: z.array(z.string()).optional().default([]),
    travelStyles: z.array(z.string()).optional().default([]),
    perfectFor: z.array(z.string()).optional().default([]),
    pace: z.string().optional().nullable(),
    comfortLevel: z.string().optional().nullable(),
    duration: z.string().optional().nullable(),
    budget: z.number().optional().nullable(),
    budgetText: z.string().optional().nullable(),
    name: z.string().optional().nullable(),
    email: z.string().optional().nullable(),
    phone: z.string().optional().nullable(),
    notes: z.string().optional().nullable(),
  }),
});

export const getJourneyWizardRequestsValidator = z.object({
  query: z.object({
    status: z.string().optional(),
    page: z.string().optional(),
    limit: z.string().optional(),
    search: z.string().optional(),
  }),
});

export const updateJourneyWizardRequestValidator = z.object({
  params: z.object({
    id: z.string(),
  }),
  body: z.object({
    status: z.enum(["NEW", "CONTACTED", "IN_PROGRESS", "CLOSED"]).optional(),
    notes: z.string().optional(),
  }),
});
