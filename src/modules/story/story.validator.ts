import { z } from "zod";

export const getStoryValidator = z.object({
  query: z.object({
    id: z.string().optional(),
    slug: z.string().optional(),
    category: z.string().optional(),
    tagPlace: z.string().optional(),
    tagTheme: z.string().optional(),
    tagLens: z.string().optional(),
    search: z.string().optional(),
    journeyId: z.string().optional(),
    relatedToId: z.string().optional(),
  }),
});

export const manageStoryValidator = z.object({
  body: z
    .object({
      id: z.string().optional(),
      title: z.string().trim().min(1, "Title cannot be empty").optional(),
      slug: z.string().trim().optional(),
      category: z.string().trim().optional(),
      categories: z.array(z.string()).optional(),
      description: z.string().optional(),
      readTime: z.string().optional(),
      image: z.string().optional(),
      templateType: z.string().optional(),
      detail: z.any().optional(),
    })
    .transform((data) => {
      // Auto-generate slug from title if not provided
      if (data.title && !data.slug) {
        data.slug = data.title
          .trim()
          .toLowerCase()
          .replace(/\s+/g, "-")
          .replace(/[^a-z0-9-]/g, "")
          .replace(/-+/g, "-")
          .replace(/^-|-$/g, "");
      }
      return data;
    })
    .superRefine((data, ctx) => {
      // CREATE rules
      if (!data.id) {
        if (!data.title) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["title"],
            message: "title is required when creating",
          });
        }
        if (!data.category) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["category"],
            message: "category is required when creating",
          });
        }
        if (!data.description) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              path: ["description"],
              message: "description is required when creating",
            });
        }
        if (!data.slug) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["slug"],
            message: "Unable to generate slug from title",
          });
        }
      }
    }),
});
