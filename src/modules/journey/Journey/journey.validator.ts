import { z } from "zod";

const JourneyTypeEnum = z.enum([
  "PRIVATE_JOURNEY",
  "SELF_DRIVE_JOURNEY",
  "SMALL_GROUP",
  "LUXURY_ESCAPE",
  "FAMILY_JOURNEY",
]);

const TravelStyleEnum = z.enum([
  "CULTURE_HERITAGE",
  "NATURE",
  "ADVENTURE",
  "FOOD_WINE",
  "COASTAL_ESCAPE",
  "MOUNTAINS",
  "SLOW_TRAVEL",
  "LUXURY",
  "PHOTOGRAPHY",
  "WELLNESS",
]);

const PerfectForEnum = z.enum([
  "COUPLES",
  "FAMILIES",
  "FRIENDS",
  "FOOD_WINE",
  "SOLO_TRAVELLERS",
  "HONEYMOONERS",
  "FIRST_TIME_VISITORS",
  "RETURNING_VISITORS",
  "NATURE_LOVERS",
  "ADVENTURE_SEEKERS",
]);

const PaceEnum = z.enum(["RELAXED", "BALANCED", "ACTIVE"]);
const ComfortLevelEnum = z.enum(["COMFORT", "BOUTIQUE", "PREMIUM_LUXURY"]);
const JourneyStatusEnum = z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]);
const multiEnumQuery = (item: z.ZodTypeAny) =>
  z
    .preprocess(
      (value) =>
        Array.isArray(value)
          ? value
          : typeof value === "string"
            ? value
                .split(",")
                .map((item) => item.trim())
                .filter(Boolean)
            : value,
      z.array(item).min(1),
    )
    .optional();

export const getJourneyValidator = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().optional(),
    limit: z.coerce.number().int().positive().max(100).optional(),
    id: z.string().trim().optional(),
    slug: z.string().trim().optional(),
    status: JourneyStatusEnum.optional(),
    featured: z.enum(["true", "false"]).optional(),
    journeyType: multiEnumQuery(JourneyTypeEnum),
    travelStyle: multiEnumQuery(TravelStyleEnum),
    perfectFor: multiEnumQuery(PerfectForEnum),
    pace: PaceEnum.optional(),
    comfortLevel: ComfortLevelEnum.optional(),
    minPrice: z.coerce.number().nonnegative().optional(),
    maxPrice: z.coerce.number().nonnegative().optional(),
    minDays: z.coerce.number().int().positive().optional(),
    maxDays: z.coerce.number().int().positive().optional(),
    locationId: z.string().trim().optional(),
    locationSlug: z.string().trim().optional(),
    search: z.string().trim().min(1).optional(),
  }),
});

export const manageJourneyValidator = z.object({
  body: z
    .object({
      id: z.string().optional(),

      title: z.string().trim().optional(),
      slug: z.string().trim().optional(),
      subtitle: z.string().trim().optional(),

      price: z.coerce.number().positive().optional(),
      currency: z.string().trim().optional(),
      minDays: z.coerce.number().int().positive().optional(),
      maxDays: z.coerce.number().int().positive().optional(),

      journeyHeroImage: z.array(z.string()).optional(),
      journeyGallery: z.array(z.string()).optional(),
      highlights: z.array(z.string()).optional(),
      included: z.array(z.string()).optional(),
      notIncluded: z.array(z.string()).optional(),

      journeyType: z.array(JourneyTypeEnum).optional(),
      travelStyle: z.array(TravelStyleEnum).optional(),
      perfectFor: z.array(PerfectForEnum).optional(),
      pace: PaceEnum.optional(),
      comfortLevel: ComfortLevelEnum.optional(),

      status: JourneyStatusEnum.optional(),
      featured: z.coerce.boolean().optional(),

      metadata: z.any().optional(),
      data: z.any().optional(),
      accommodations: z.any().optional(),
    })
    .transform((data) => {
      // Name থেকে slug generate
      if (data.title) {
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
      if (!data.id) {
        const required: [keyof typeof data, string][] = [
          ["title", "title"],
          ["price", "price"],
          ["minDays", "minDays"],
          ["maxDays", "maxDays"],
          ["pace", "pace"],
          ["comfortLevel", "comfortLevel"],
        ];

        for (const [key, label] of required) {
          if (data[key] === undefined) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              path: [key],
              message: `${label} is required when creating Journey`,
            });
          }
        }
      }

      if (
        data.minDays !== undefined &&
        data.maxDays !== undefined &&
        data.minDays > data.maxDays
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["maxDays"],
          message: "maxDays must be greater than or equal to minDays",
        });
      }
    }),
});
