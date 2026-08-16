import { z } from "zod";

export const getJourneysValidator = z.object({
  body: z.object({
    id: z.string().optional(),
    name: z.string().optional(),
    slug: z
      .string()
      .optional()
      .transform((v) => v?.toLowerCase()),
  }),
});
export const manageJourneysValidator = z.object({
  body: z
    .object({
      id: z.string().optional(),
      name: z.string().optional(),
      slug: z.string().optional(),
      text: z.string().optional(),
      location: z.string().optional(),
      url: z.string().optional(),
      isFeatured: z.boolean().default(false),
    })
    .superRefine((data: any, ctx: z.RefinementCtx) => {
      if (!data.id) {
        const requiredFields = ["name", "slug"];
        requiredFields.forEach((field) => {
          if (!data[field]) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              path: [field],
              message: `${field} is required when creating`,
            });
          }
        });
      }
    }),
});
