import { z } from "zod";

export const getJourneyLocationValidator = z.object({
  query: z.object({}),
});

export const manageJourneyLocationValidator = z.object({
  body: z
    .object({
      id: z.string().optional(),
      journeyId: z.string().trim().optional(),
      locationId: z.string().trim().optional(),
      order: z.coerce.number().int().optional(),
    })
    .superRefine((data, ctx) => {
      if (!data.id) {
        if (!data.journeyId) {
          ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["journeyId"], message: "journeyId is required" });
        }
        if (!data.locationId) {
          ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["locationId"], message: "locationId is required" });
        }
      }
    }),
});