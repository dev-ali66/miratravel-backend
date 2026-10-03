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
  "ACCOMMODATION",
  "OTHER",
  "TEST",
]);

export const getLocationValidator = z.object({
  query: z.object({
    id: z.string().optional(),
    featured: z.union([z.string(), z.boolean()]).optional(),

    // name: z.string().trim().optional(),

    // slug: z.string().trim().optional(),

    parentId: z.string().optional(),
  }),
});

export const manageLocationValidator = z.object({
  body: z
    .object({
      id: z.string().optional(),

      name: z.string().trim().min(1, "Name cannot be empty").optional(),

      slug: z.string().trim().optional(),

      type: locationTypeEnum.optional(),

      featured: z.boolean().optional(),

      parentId: z.string().optional().nullable(),

      geoData: z.any().optional(),

      metadata: z.any().optional(),

      data: z.any().optional(),

      hero: z.any().optional(),
      card: z.any().optional(),
      essence: z.any().optional(),
      infoCard: z.any().optional(),
      highlights: z.any().optional(),
      statistics: z.any().optional(),
      why: z.any().optional(),
      explore: z.any().optional(),
      glance: z.any().optional(),
      experience: z.any().optional(),
      regionExperiences: z.any().optional(),
      character: z.any().optional(),
      travelInsight: z.any().optional(),
      journeyList: z.any().optional(),
      sharedInfo: z.any().optional(),
      signatureExperiences: z.any().optional(),
      stories: z.any().optional(),
      accommodation: z.any().optional(),
      faq: z.any().optional(),
      travelInfo: z.any().optional(),
      cta: z.any().optional(),
    })
    .passthrough()
    .transform((data) => {
      // Name থেকে slug generate if slug is not explicitly provided
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
