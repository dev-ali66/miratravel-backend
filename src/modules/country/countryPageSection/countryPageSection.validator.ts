import { z } from "zod";

export const getCountryPageSectionValidator = z.object({
  query: z.object({
    // id: z.string().optional(),
    // pageId: z.string().optional(),
    // name: z.string().optional(),
    // slug: z.string().optional(),
    // search: z.string().optional(),
  }),
});

export const manageCountryPageSectionValidator = z.object({
  body: z
    .object({
      id: z.string().optional(),

      pageId: z.string().trim().optional(),

      name: z.string().trim().optional(),

      slug: z.string().trim().optional(),

      order: z.coerce.number().int().optional(),

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
      // -------------------------
      // CREATE
      // -------------------------

      if (!data.id) {
        if (!data.pageId) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["pageId"],
            message: "pageId is required when creating Country Page Section",
          });
        }

        if (!data.name) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["name"],
            message: "name is required when creating Country Page Section",
          });
        }

        if (!data.slug) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["slug"],
            message: "slug is required when creating Country Page Section",
          });
        }
      }
    }),
});
