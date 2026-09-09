import { z } from "zod";

export const getUsersValidator = z.object({
  query: z
    .object({
      id: z.string().optional(),
      email: z.string().optional(),
      search: z.string().optional(),
      role: z.string().optional(),
      status: z.string().optional(),
      isVerified: z.string().optional(),
      page: z.string().optional(),
      limit: z.string().optional(),
    })
    .optional(),
});

export const createUpdateUserValidator = z.object({
  body: z.object({
    id: z.string().optional(),
    email: z.string().email().optional(),
    password: z.string().min(6).optional(),
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    phone: z.string().optional(),
    status: z.enum(["ACTIVE", "INACTIVE", "DEACTIVE", "BLOCKED", "SUSPENDED", "PENDING", "DELETED", "ARCHIVED"]).optional(),
    isVerified: z.boolean().optional(),
    termsAccepted: z.boolean().optional(),
    role: z.string().optional(),
    roleId: z.string().optional(),
    roles: z.string().optional(),
  }),
});
