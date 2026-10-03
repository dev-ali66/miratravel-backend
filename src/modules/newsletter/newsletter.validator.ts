import { z } from "zod";

export const subscribeNewsletterValidator = z.object({
  body: z.object({
    email: z.string().email("Invalid email address"),
    source: z.string().optional().default("FOOTER"),
    action: z.enum(["subscribe", "unsubscribe"]).optional().default("subscribe"),
    reason: z.string().optional(),
  }),
});

export const getNewsletterSubscribersValidator = z.object({
  query: z.object({
    search: z.string().optional(),
    status: z.string().optional(),
    page: z.union([z.string(), z.number()]).optional(),
    limit: z.union([z.string(), z.number()]).optional(),
  }).optional(),
});

export const updateNewsletterSubscriberValidator = z.object({
  params: z.object({
    id: z.string().optional(),
  }).optional(),
  body: z.object({
    status: z.enum(["SUBSCRIBED", "UNSUBSCRIBED"]).optional(),
    source: z.string().optional(),
  }),
});
