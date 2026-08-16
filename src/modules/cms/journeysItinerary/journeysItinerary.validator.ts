import { z } from "zod";

export const getjourneysItineraryValidator = z.object({
  body: z.object({
    id: z.string().optional(),
    name: z.string().optional(),
    slug: z
      .string()
      .optional()
      .transform((v) => v?.toLowerCase()),
  }),
});
export const managejourneysItineraryValidator = z.object({
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
      journeysItinerarySectionImages: z.string().optional(),
      journeysItinerarySectionVideos: z.string().optional(),
      data: z.string().optional(),
      isPublished: z.boolean().default(false),
    })
    .superRefine((data: any, ctx: z.RefinementCtx) => {
      if (!data.id) {
        const requiredFields = ["journeyId"];
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
