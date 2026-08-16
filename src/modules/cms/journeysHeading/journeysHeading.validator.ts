import { z } from "zod";

export const getjourneysHeadingValidator = z.object({
  body: z.object({
    id: z.string().optional(),
    name: z.string().optional(),
    slug: z
      .string()
      .optional()
      .transform((v) => v?.toLowerCase()),
  }),
});
export const managejourneysHeadingValidator = z.object({
  body: z
    .object({
      id: z.string().optional(),
      journeyId: z.string().optional(),
      order: z.string().optional(),
      key: z.string().optional(),
      title: z.string().optional(),
      subTitle: z.string().optional(),
      h1: z.string().optional(),
      h2: z.string().optional(),
      text: z.string().optional(),
      features: z.string().optional(),
      small: z.string().optional(),
      button: z.string().optional(),
      buttonUrl: z.string().optional(),
      maxGuest: z.string().optional(),
      data: z.string().optional(),
      isPublished: z.boolean().default(false),
    })
    .superRefine((data: any, ctx: z.RefinementCtx) => {
      if (!data.id) {
        const requiredFields = ["journeyId", "maxGuest"];
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
