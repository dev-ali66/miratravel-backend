import { z } from "zod";

export const getEnumValidator = z.object({
  query: z.object({
    name: z.string().optional(),
  }),
});
