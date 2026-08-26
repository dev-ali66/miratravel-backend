import { z } from "zod";

export const getCmsPageValidator = z.object({
  query: z.object({
    id: z.string().optional(),
    name: z.string().optional(),
    slug: z.string().optional(),
  }),
});

export const manageCmsPageValidator = z.object({
  body: z
    .object({
      id: z.string().optional(),

      name: z
        .string()
        .trim()
        .min(1, "Name cannot be empty")
        .optional(),

      slug: z.string().optional(),

      metadata: z.any().optional(),

      data: z.any().optional(),
    })
    .transform((data) => {
      // Name থেকে slug generate
      if (data.name) {
        data.slug = data.name
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
      // Create
      if (!data.id) {
        if (!data.name) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["name"],
            message: "name is required when creating",
          });
        }

        if (!data.slug) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["slug"],
            message: "Unable to generate slug from name",
          });
        }
      }
    }),
});