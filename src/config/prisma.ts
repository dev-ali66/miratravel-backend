import { PrismaClient } from "@prisma/client";
import { registerPrismaLogger } from "../logger/prisma.logger.js";
import config from "./index.js";

declare global {
  var prisma: PrismaClient | undefined;
}

const createPrismaClient = () => {
  const client = new PrismaClient({
    log:
      config.NODE_ENV === "development"
        ? [
            {
              emit: "event",
              level: "query",
            },
            {
              emit: "event",
              level: "info",
            },
            {
              emit: "event",
              level: "warn",
            },
            {
              emit: "event",
              level: "error",
            },
          ]
        : [
            {
              emit: "event",
              level: "warn",
            },
            {
              emit: "event",
              level: "error",
            },
          ],
  });

  const readActions = new Set([
    "findUnique",
    "findUniqueOrThrow",
    "findFirst",
    "findFirstOrThrow",
    "findMany",
    "count",
    "aggregate",
    "groupBy",
  ]);

  registerPrismaLogger(client);

  return client.$extends({
    query: {
      $allModels: {
        async $allOperations({ operation, args, query }: any) {
          if (!readActions.has(operation)) return query(args);

          const where = args?.where ?? {};

          // Hide soft-deleted records by default. An explicit `deletedAt`
          // filter is preserved for admin/restore use cases.
          if (where.deletedAt !== undefined) return query(args);

          return query({
            ...args,
            where: { ...where, deletedAt: null },
          }).catch((err: any) => {
            if (
              err?.name === "PrismaClientValidationError" &&
              err?.message?.includes("Unknown argument `deletedAt`")
            ) {
              return query(args);
            }
            throw err;
          });
        },
      },
    },
  }) as unknown as PrismaClient;
};

const prisma = global.prisma ?? createPrismaClient();

if (config.NODE_ENV !== "production") {
  global.prisma = prisma;
}

export default prisma;

