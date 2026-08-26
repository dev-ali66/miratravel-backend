import { z } from "zod";

export const getCountryPageValidator = z.object({
  query: z.object({
    // id: z.string().optional(),

    // locationId: z.string().optional(),
  }),
});

export const manageCountryPageValidator = z.object({
  body: z
    .object({
      id: z.string().optional(),

      locationId: z.string().trim().optional(),

      metadata: z.any().optional(),
      data: z.any().optional(),

    })
    .superRefine((data, ctx) => {
      // CREATE
      if (!data.id) {
        if (!data.locationId) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["locationId"],
            message: "locationId is required when creating Country Page",
          });
        }
      }
    }),
});