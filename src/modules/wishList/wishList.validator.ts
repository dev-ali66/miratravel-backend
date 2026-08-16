import { z } from "zod";

export const getWishlistValidator = z.object({
  body: z.object({
    id: z.string().optional(),
    name: z.string().optional(),
    slug: z
      .string()
      .optional()
      .transform((v) => v?.toLowerCase()),
  }),
});
export const manageWishlistValidator = z.object({
  body: z.object({
    journeyId: z.string(),
  }),
});
