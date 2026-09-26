import { z } from "zod";

export const getWishlistValidator = z.object({
  query: z
    .object({
      id: z.string().optional(),
      authId: z.string().optional(),
      journeyId: z.string().optional(),
    })
    .optional(),
});

export const manageWishlistValidator = z.object({
  body: z.object({
    // id: z.string().optional(),
    journeyId: z.string().optional(),
  }),
});
