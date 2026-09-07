import { z } from "zod";

export const getStoryCategoryValidator = z.object({
  query: z.object({
    search: z.string().optional(),
  }),
});

export const createStoryCategoryValidator = z.object({
  body: z.object({
    name: z.string().trim().min(1, "Category name is required"),
  }),
});

export const deleteStoryCategoryValidator = z.object({
  params: z.object({
    id: z.string().min(1, "Category ID is required"),
  }),
});
