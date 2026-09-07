import { z } from "zod";

export const getStoryTypesValidator = z.object({
  query: z.object({
    search: z.string().optional(),
  }),
});

export const createStoryTypeValidator = z.object({
  body: z.object({
    name: z.string().trim().min(1, "Name is required"),
  }),
});

export const deleteStoryTypeValidator = z.object({
  params: z.object({
    id: z.string().min(1, "ID is required"),
  }),
});
