import { z } from "zod";

export const getPagesSectionSchemaValidator = z.object({
  query: z.object({
    id: z.string().optional(),
    pageId: z.string().optional(),
    order: z.string().optional(),
    slug: z.string().optional(),
    title: z.string().optional(),
    key: z.string().optional(),
    data: z.string().optional(),
  }),
});

export const managePagesSectionSchemaValidator = z.object({
  body: z
    .object({
      id: z.string().optional(),
      pageId: z.string().optional(),
      order: z.string().optional(),
      key: z.string().optional(),
      title: z.string().optional(),
      subTitle: z.string().optional(),
      h1: z.string().optional(),
      h2: z.string().optional(),
      text: z.string().optional(),
      small: z.string().optional(),
      button: z.string().optional(),
      buttonUrl: z.string().optional(),
      pageSectionImages: z.string().optional(),
      pageSectionVideos: z.string().optional(),
      data: z.string().optional(),
    })
    .superRefine((data: any, ctx: z.RefinementCtx) => {
      if (!data.id) {
        const requiredFields = ["pageId", "order", "key"];

        requiredFields.forEach((field) => {
          if (data[field as keyof typeof data] === undefined) {
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
