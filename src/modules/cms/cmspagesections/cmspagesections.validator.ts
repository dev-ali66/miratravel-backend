import { z } from "zod";

export const getCmsPageSectionsValidator = z.object({
  query: z.object({
    id: z.string().optional(),
    pageId: z.string().optional(),
    name: z.string().optional(),
    slug: z.string().optional(),
    type: z.string().optional(),
  }),
});

export const manageCmsPageSectionsValidator = z.object({
  body: z
    .object({
      id: z.string().trim().optional(),

      pageId: z.string().trim().min(1, "Page ID cannot be empty").optional(),

      name: z.string().trim().min(1, "Name cannot be empty").optional(),

      slug: z.string().optional(),

      type: z.string().trim().min(1, "Type cannot be empty").optional(),

      order: z.preprocess(
        (value) => {
          if (typeof value === "string" && value.trim() !== "") {
            const numberValue = Number(value);

            if (!Number.isNaN(numberValue)) {
              return numberValue;
            }
          }

          return value;
        },
        z
          .number({
            message: "Order must be a valid number",
          })
          .int("Order must be an integer")
          .min(0, "Order cannot be negative")
          .optional(),
      ),

      metadata: z.any().optional(),

      data: z.any().optional(),
    })
    .transform((data) => {
      // Generate slug from name
      if (data.name) {
        data.slug = data.name
          .trim()
          .toLowerCase()
          .replace(/\s+/g, "-")
          .replace(/[^a-z0-9-]/g, "")
          .replace(/-+/g, "-")
          .replace(/^-+|-+$/g, "");
      }

      return data;
    })
    .superRefine((data, ctx) => {
      // Create
      if (!data.id) {
        const requiredFields = {
          pageId: data.pageId,
          name: data.name,
          slug: data.slug,
          type: data.type,
        };

        Object.entries(requiredFields).forEach(([field, value]) => {
          if (!value) {
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
