import { z } from "zod";

export const getjourneyAccommodationValidator = z.object({ query: z.object({}) });

export const managejourneyAccommodationValidator = z.object({
  body: z
    .object({
      id: z.string().optional(),
      journeyId: z.string().trim().optional(),
      dayNumber: z.coerce.number().int().positive().optional(),
      title: z.string().trim().optional(),
      description: z.string().trim().optional(),
      locationId: z.string().trim().optional(),
      metadata: z.any().optional(),
      data: z.any().optional(),
      fileRemove: z.any().optional(),
    })
    .transform((data) => {
      if (data.title) {
        (data as any).slug = data.title
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
        if (!data.journeyId) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["journeyId"], message: "journeyId is required" });
        if (!data.dayNumber) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["dayNumber"], message: "dayNumber is required" });
        if (!data.title) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["title"], message: "title is required" });
      }
    }),
});