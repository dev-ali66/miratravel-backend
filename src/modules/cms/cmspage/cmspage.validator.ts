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

      name: z.string().trim().min(1, "Name cannot be empty").optional(),

      slug: z.string().optional(),

      metadata: z.any().optional(),

      data: z.any().optional(),
    })
    .transform((data) => {
      // If slug provided without name, generate name from slug
      if (!data.name && data.slug) {
        data.name = data.slug
          .replace(/[-_]+/g, " ")
          .trim()
          .replace(/\b\w/g, (c) => c.toUpperCase());
      }

      // If name provided without slug, generate slug from name
      if (!data.slug && data.name) {
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
      // Create requires either name or slug
      if (!data.id) {
        if (!data.name && !data.slug) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["name"],
            message: "name or slug is required when creating",
          });
        }
      }
    }),
});
