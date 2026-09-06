import { PrismaClient } from "@prisma/client";
import { logger } from "./logger.logger.js";

const formatPrismaError = (message: string) => {
  const unknownField = message.match(/Unknown argument `(.+?)`/)?.[1];

  const location = message.match(/invocation in\s+(.+):(\d+):(\d+)/);

  const relativePath =
    location?.[1].match(/src[\\/].*/)?.[0] ??
    location?.[1].split(/[\\/]/).pop();
  return {
    field: unknownField ?? null,

    location: location ? `${relativePath}:${location[2]}` : null,

    message: unknownField
      ? `Invalid field '${unknownField}'. Field does not exist in Prisma schema.`
      : message.split("\n").filter(Boolean).pop(),
  };
};
export const registerPrismaLogger = (prisma: PrismaClient) => {
  // ---------------- QUERY ----------------

  prisma.$on("query" as never, (e: any) => {
    logger.debug("Prisma Query", {
      query: e.query,
      params: e.params,
      duration: `${e.duration} ms`,
      target: e.target,
    });

    // Slow Query
    if (e.duration >= 1000) {
      logger.warn("Slow Prisma Query", {
        query: e.query,
        params: e.params,
        duration: `${e.duration} ms`,
      });
    }
  });

  // ---------------- INFO ----------------

  prisma.$on("info" as never, (e: any) => {
    logger.info("Prisma Info", {
      message: e.message,
      target: e.target,
    });
  });

  // ---------------- WARNING ----------------

  prisma.$on("warn" as never, (e: any) => {
    logger.warn("Prisma Warning", {
      message: e.message,
      target: e.target,
    });
  });

  // ---------------- ERROR ----------------

  prisma.$on("error" as never, (e: any) => {
    logger.error("Prisma Error", {
      target: e.target,
      ...formatPrismaError(e.message),
    });
  });
};
