import { z } from "zod";

export const getrolesValidator = z.object({
  body: z.object({
    id: z.string().optional(),
    name: z.string().optional(),
  }),
});
export const managerolesValidator = z.object({
  body: z
    .object({
      id: z.string().optional(),
      name: z.string().optional(),
      permissions: z
        .union([
          z.array(z.string()),
          z.string(),
        ])
        .optional()
        .transform((value) => {
          if (!value) return;

          if (Array.isArray(value)) {
            return value;
          }

          try {
            const parsed = JSON.parse(value);

            if (Array.isArray(parsed)) {
              return parsed;
            }

            return [value];
          } catch {
            return [value];
          }
        }),
    })
    .superRefine((data: any, ctx: z.RefinementCtx) => {
      if (!data.id) {
        const requiredFields = ["name"];
        requiredFields.forEach((field) => {
          if (!data[field]) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              path: [field],
              message: `${field} is required when creating`,
            });
          }
        });
      }
    }),
});
