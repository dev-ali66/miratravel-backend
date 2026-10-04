import { z } from "zod";

export const getStoryValidator = z.object({
  query: z.object({
    id: z.string().optional(),
    slug: z.string().optional(),
    category: z.string().optional(),
    type: z.string().optional(),
    status: z.string().optional(),
    featured: z.enum(["true", "false"]).optional(),
    recommended: z.enum(["true", "false"]).optional(),
    tagPlace: z.string().optional(),
    tagTheme: z.string().optional(),
    tagLens: z.string().optional(),
    search: z.string().optional(),
    journeyId: z.string().optional(),
    locationId: z.string().optional(),
    relatedToId: z.string().optional(),
    page: z.coerce.number().int().positive().optional(),
    limit: z.coerce.number().int().positive().max(100).optional(),
  }),
});

export const manageStoryValidator = z.object({
  body: z
    .object({
      id: z.string().optional(),
      slug: z.string().trim().optional(),
      title: z.string().trim().min(1, "Title cannot be empty").optional(),
      categories: z.any().optional(),
      type: z.string().optional(),
      readTime: z.string().optional(),
      authorName: z.string().optional(),
      authorRole: z.string().optional(),
      status: z.string().optional(),
      featured: z.any().optional(),
      recommended: z.any().optional(),
      hero: z.any().optional(),
      intro: z.any().optional(),
      blocks: z.any().optional(),
      practicalNotes: z.any().optional(),
      practicalNotesData: z.any().optional(),
      seo: z.any().optional(),
      journeys: z.any().optional(),
      journeyIds: z.any().optional(),
      locations: z.any().optional(),
      locationIds: z.any().optional(),
      manualRelatedStories: z.any().optional(),
      manualRelatedStoryIds: z.any().optional(),
    })
    .passthrough()
    .transform((data) => {
      // Slug is ALWAYS auto-generated from title
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
      // CREATE check
      if (!data.id) {
        if (!data.title) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["title"],
            message: "title is required when creating",
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

export const deleteStoryValidator = z.object({
  query: z.object({
    id: z.string().min(1, "Story ID is required"),
  }),
});
