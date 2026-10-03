import { z } from "zod";

export const getStoryValidator = z.object({
  query: z.object({
    id: z.string().optional(),
    slug: z.string().optional(),
    category: z.string().optional(),
    tagPlace: z.string().optional(),
    tagTheme: z.string().optional(),
    tagLens: z.string().optional(),
    search: z.string().optional(),
    journeyId: z.string().optional(),
    relatedToId: z.string().optional(),
  }),
});

export const manageStoryValidator = z.object({
  body: z.object({
    id: z.string().optional(),
    title: z.string().min(1, "Title is required"),
    slug: z.string().min(1, "Slug is required"),
    category: z.string().optional(),
    categories: z.array(z.string()).optional(),
    type: z.enum(["short_story", "long_story", "guidance"]).optional(),
    status: z.enum(["DRAFT", "PUBLISHED"]).optional(),
    readTime: z.string().optional(),
    authorName: z.string().optional(),
    authorRole: z.string().optional(),
    description: z.string().optional(),
    featured: z.boolean().optional(),
    recommended: z.boolean().optional(),
    templateType: z.string().optional(),
    detail: z.record(z.string(), z.any()).optional(),
  }),
});

export const deleteStoryValidator = z.object({
  query: z.object({
    id: z.string().min(1, "Story ID is required"),
  }),
});
