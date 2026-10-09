import { z } from "zod";

export const getWishlistValidator = z.object({
  query: z
    .object({
      id: z.string().optional(),
      authId: z.string().optional(),
      journeyId: z.string().optional(),
      sortBy: z.enum(["price", "createdAt", "time", "journeyCreatedAt"]).optional(),
      order: z.enum(["asc", "desc", "ASC", "DESC"]).optional(),
      sortOrder: z.enum(["asc", "desc", "ASC", "DESC"]).optional(),
      sort: z.enum(["asc", "desc", "ASC", "DESC"]).optional(),
      journeyType: z.union([z.string(), z.array(z.string())]).optional(),
      type: z.union([z.string(), z.array(z.string())]).optional(),
      minPrice: z.preprocess((val) => (val !== undefined && val !== "" ? Number(val) : undefined), z.number().optional()),
      maxPrice: z.preprocess((val) => (val !== undefined && val !== "" ? Number(val) : undefined), z.number().optional()),
      search: z.string().optional(),
      page: z.preprocess((val) => (val !== undefined && val !== "" ? Number(val) : undefined), z.number().optional()),
      limit: z.preprocess((val) => (val !== undefined && val !== "" ? Number(val) : undefined), z.number().optional()),
    })
    .passthrough()
    .optional(),
});

export const manageWishlistValidator = z.object({
  body: z.object({
    // id: z.string().optional(),
    journeyId: z.string().optional(),
  }),
});
