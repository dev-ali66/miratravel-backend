import { z } from "zod";

const locationTypeEnum = z.enum([
  "CONTINENT",
  "SUBCONTINENT",
  "REGION",
  "COUNTRY",
  "ADMINISTRATIVE_AREA",
  "CITY",
  "TOWN",
  "VILLAGE",
  "DESTINATION",
  "PLACE",
  "LANDMARK",
]);

export const getLocationValidator = z.object({
  query: z.object({
    id: z.string().optional(),

    // name: z.string().trim().optional(),

    // slug: z.string().trim().optional(),

    parentId: z.string().optional(),
  }),
});

export const manageLocationValidator = z.object({
  body: z
    .object({
      id: z.string().optional(),

      name: z
        .string()
        .trim()
        .min(1, "Name cannot be empty")
        .optional(),

      slug: z
        .string()
        .trim()
        .optional(),

      type: locationTypeEnum.optional(),

      parentId: z.string().optional().nullable(),

      geoData: z.any().optional(),

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
      // CREATE
      if (!data.id) {
        if (!data.name) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["name"],
            message: "name is required when creating",
          });
        }

        if (!data.type) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["type"],
            message: "type is required when creating",
          });
        }

        if (!data.slug) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["slug"],
            message: "Unable to generate slug from name",
          });
        }

        // Root location হলে parentId লাগবে না
        // CONTINENT সাধারণত parent ছাড়া হবে
      }
    }),
});