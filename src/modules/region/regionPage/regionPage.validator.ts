import { z } from "zod";

export const getRegionPageValidator = z.object({
  query: z.object({
    // id: z.string().optional(),
    // locationId: z.string().optional(),
    // name: z.string().optional(),
    // slug: z.string().optional(),
    // search: z.string().optional(),
  }),
});

export const manageRegionPageValidator = z.object({
  body: z
    .object({
      id: z.string().optional(),

      locationId: z
        .string()
        .trim()
        .optional(),

      metadata: z.any().optional(),
    })
    .superRefine((data, ctx) => {
      // CREATE
      if (!data.id && !data.locationId) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["locationId"],
          message: "locationId is required when creating Region Page",
        });
      }
    }),
});