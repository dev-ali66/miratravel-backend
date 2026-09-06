import { z } from "zod";

const ActionEnum = z.enum(["CREATE", "READ", "UPDATE", "DELETE"]);

const ScopeEnum = z.enum(["OWN", "OTHER", "ANY"]);

export const getPermissionsValidator = z.object({
  body: z.object({
    id: z.string().optional(),
    action: z.string().optional(),
    resource: z.string().optional(),
    scope: z.string().optional(),
  }),
});

export const managePermissionsValidator = z.object({
  body: z
    .object({
      id: z.string().optional(),

      action: ActionEnum.optional(),

      resource: z.string().optional(),

      scope: ScopeEnum.optional(),

      roles: z
        .union([z.array(z.string()), z.string()])
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
    .superRefine((data, ctx) => {
      if (!data.id) {
        if (!data.action) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["action"],
            message: "action is required when creating",
          });
        }

        if (!data.scope) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["scope"],
            message: "scope is required when creating",
          });
        }
      }
    }),
});
