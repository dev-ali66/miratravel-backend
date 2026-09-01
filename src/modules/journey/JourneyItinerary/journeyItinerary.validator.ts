import { z } from "zod";

export const getJourneyItineraryValidator = z.object({ query: z.object({}) });

export const manageJourneyItineraryValidator = z.object({
  body: z
    .object({
      id: z.string().optional(),
      journeyId: z.string().trim().optional(),
      dayNumber: z.coerce.number().int().positive().optional(),
      title: z.string().trim().optional(),
      description: z.string().trim().optional(),
      journeyItineraryImage: z.array(z.string()).optional(),
      locationId: z.string().trim().optional(),
      metadata: z.any().optional(),
      data: z.any().optional(),

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
        if (!data.description) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["description"], message: "description is required" });
        if (!data.journeyItineraryImage) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["journeyItineraryImage"], message: "journeyItineraryImage is required" });
        if (!data.locationId) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["locationId"], message: "locationId is required" });
        if (!data.metadata) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["metadata"], message: "metadata is required" });
        if (!data.data) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["data"], message: "data is required" });
      }
    }),
});