import { z } from "zod";

export const getJourneyAddOnValidator = z.object({
  query: z.object({}),
});

export const manageJourneyAddOnValidator = z.object({
  body: z
    .object({
      id: z.string().optional(),
      journeyId: z.string().trim().optional(),
      addOnId: z.string().trim().optional(),
      locationId: z.string().trim().optional(),
    })
    .superRefine((data, ctx) => {
      if (!data.id) {
        if (!data.journeyId) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["journeyId"],
            message: "journeyId is required",
          });
        }
        if (!data.addOnId) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["addOnId"],
            message: "addOnId is required",
          });
        }
        if (!data.locationId) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["locationId"],
            message: "locationId is required",
          });
        }
      }
    }),
});
