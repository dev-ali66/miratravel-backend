import { z } from "zod";

export const getExperienceValidator = z.object({
  query: z
    .object({
      id: z.string().optional(),
      featured: z.union([z.string(), z.boolean()]).optional(),
      parentId: z.string().optional(),
      name: z.string().trim().optional(),
      slug: z.string().trim().optional(),
      search: z.string().trim().optional(),
      priceType: z.string().trim().optional(),
      minPrice: z.coerce.number().nonnegative().optional(),
      maxPrice: z.coerce.number().nonnegative().optional(),
    })
    .passthrough(),
});

export const manageExperienceValidator = z.object({
  body: z
    .object({
      id: z.string().optional(),
      name: z.string().trim().min(1, "Name cannot be empty").optional(),
      slug: z.string().trim().optional(),
      featured: z.boolean().optional(),
      price: z.coerce.number().nonnegative().optional().nullable(),
      priceType: z.string().trim().optional().nullable(),
      parentId: z.string().optional().nullable(),
      geoData: z.any().optional(),
      metadata: z.any().optional(),
      hero: z.any().optional(),
      essence: z.any().optional(),
      faq: z.any().optional(),
    })
    .passthrough()
    .transform((data) => {
      // Auto-generate slug from name if not explicitly provided
      if (data.name && (!data.slug || !data.slug.trim())) {
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
      // Validation on CREATE
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
