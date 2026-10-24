import { z } from "zod";

export const getMediaGalleryValidator = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/).optional(),
    limit: z.string().regex(/^\d+$/).optional(),
    search: z.string().optional(),
    type: z.enum(["all", "image", "video"]).optional(),
    status: z.enum(["ACTIVE", "IN_TRASH", "ALL"]).optional(),
    sortBy: z.enum(["createdAt", "size", "fileName", "title"]).optional(),
    sortOrder: z.enum(["asc", "desc"]).optional(),
  }),
});

export const getMediaByIdValidator = z.object({
  params: z.object({
    id: z.string().min(1, "Media ID is required"),
  }),
});

export const updateMediaMetadataValidator = z.object({
  params: z.object({
    id: z.string().min(1, "Media ID is required"),
  }),
  body: z.object({
    title: z.string().max(200).optional().nullable(),
    altText: z.string().max(300).optional().nullable(),
    caption: z.string().max(500).optional().nullable(),
  }),
});

export const bulkMediaActionValidator = z.object({
  body: z.object({
    ids: z.array(z.string().min(1)).min(1, "At least one media ID is required"),
  }),
});
