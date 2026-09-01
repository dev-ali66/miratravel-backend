import { z } from "zod";

export const getPaymentConfigValidator = z.object({
  query: z.object({
    scope: z.string().trim().optional(), // "global" (default) or "journey:<id>"
  }),
});

export const upsertPaymentConfigValidator = z.object({
  body: z.object({
    scope: z.string().trim().default("global"), // "global" or "journey:<id>" (spec §6: per-product override)
    depositEnabled: z.coerce.boolean().optional(),
    depositType: z.enum(["PERCENTAGE", "FIXED"]).optional(),
    depositValue: z.coerce.number().nonnegative().optional(),
    finalPaymentDueDaysBeforeDeparture: z.coerce.number().int().nonnegative().optional(),
    fullPaymentRequiredIfWithinDays: z.coerce.number().int().nonnegative().optional(),
    allowAdminOverride: z.coerce.boolean().optional(),
    reservationWithoutPayment: z.coerce.boolean().optional(),
  }),
});
