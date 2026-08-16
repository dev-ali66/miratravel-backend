import { z } from "zod";

export const getDestinationValidator = z.object({
  body: z.object({
    id: z.string().optional(),
    name: z.string().optional(),
    slug: z
      .string()
      .optional()
      .transform((v) => v?.toLowerCase()),
  }),
});
export const manageDestinationValidator = z.object({
  body: z
    .object({
      id: z.string().optional(),
      name: z.string().optional(),
      slug: z.string().optional(),
      text: z.string().optional(),
      url: z.string().optional(),
      destinationImages: z.string().optional(),
      destinationVideos: z.string().optional(),
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
