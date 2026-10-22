import { z } from "zod";

export const experienceTypeEnum = z.enum([
  "CULTURE_HERITAGE",
  "NATURE_WILDLIFE",
  "ADVENTURE_OUTDOORS",
  "FOOD_WINE",
  "LOCAL_LIFE_TRADITIONS",
  "ART_ARCHITECTURE",
  "COASTAL_MARITIME",
  "WELLNESS_SLOW_LIVING",
]);

export const journeyStatusEnum = z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]);

export const getExperienceValidator = z.object({
  query: z
    .object({
      id: z.string().optional(),
      featured: z.union([z.string(), z.boolean()]).optional(),
      status: journeyStatusEnum.optional(),
      primaryType: experienceTypeEnum.optional(),
      secondaryTypes: z.union([z.string(), z.array(z.string())]).optional(),
      attributes: z.union([z.string(), z.array(z.string())]).optional(),
      countryId: z.string().optional(),
      regionId: z.string().optional(),
      placeId: z.string().optional(),
      parentId: z.string().optional(),
      name: z.string().trim().optional(),
      slug: z.string().trim().optional(),
      search: z.string().trim().optional(),
      priceType: z.string().trim().optional(),
      currency: z.string().trim().optional(),
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
      status: journeyStatusEnum.default("PUBLISHED").optional(),
      featured: z.boolean().optional(),

      // Classification
      primaryType: experienceTypeEnum.default("CULTURE_HERITAGE").optional(),
      secondaryTypes: z.array(experienceTypeEnum).default([]).optional(),
      attributes: z.array(z.string()).default([]).optional(),

      // Pricing & Commercial
      price: z.coerce.number().nonnegative().default(0).optional(),
      currency: z.string().trim().default("EUR").optional(),
      priceType: z.string().trim().optional().nullable(),

      // Geography Linking
      countryId: z.string().optional().nullable(),
      regionId: z.string().optional().nullable(),
      placeId: z.string().optional().nullable(),
      parentId: z.string().optional().nullable(),

      // Editorial Content Sections
      subtitle: z.string().optional().nullable(),
      summary: z.string().optional().nullable(),
      theExperience: z.any().optional().nullable(),
      highlights: z.any().optional().nullable(),
      practicalInfo: z.any().optional().nullable(),
      miraTouch: z.any().optional().nullable(),
      enquiryCta: z.any().optional().nullable(),

      // Multimedia & Legacy
      hero: z.any().optional().nullable(),
      gallery: z.any().optional().nullable(),
      essence: z.any().optional().nullable(),
      faq: z.any().optional().nullable(),
      geoData: z.any().optional().nullable(),
      metadata: z.any().optional().nullable(),

      // Relationship IDs
      journeys: z.array(z.string()).optional(),
      stories: z.array(z.string()).optional(),
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
