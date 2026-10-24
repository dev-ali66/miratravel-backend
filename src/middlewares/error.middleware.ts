import { ZodError } from "zod";
import ApiError from "../utils/api.error.js";
import { NextFunction, Request, Response } from "express";

/**
 * 404 Not Found Middleware
 */
export const notFoundMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (req.originalUrl === "/favicon.ico" || req.path === "/favicon.ico") {
    return res.status(204).end();
  }
  next(new ApiError(`Cannot find ${req.originalUrl} on this server`, 404));
};

/**
 * Ultra-Advanced Global Error Handler (Single message version)
 */
export const globalErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  let statusCode = err.statusCode || 500;
  let message = "Something went wrong!";

  // --- Custom ApiError ---
  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    message = err.message;
  }

  // --- Zod validation ---
  else if (err instanceof ZodError) {
    statusCode = 400;

    const messages = err.issues.map((issue) => {
      const field = String(issue.path.slice(-1)[0] ?? "");
      return field ? `${field}: ${issue.message}` : issue.message;
    });

    message = messages.join("; ") || "Zod Validation failed";
  }

  // --- Prisma known request error ---
  else if (err?.name === "PrismaClientKnownRequestError") {
    const metaTarget = Array.isArray(err.meta?.target)
      ? err.meta.target
      : err.meta?.target
        ? [err.meta.target]
        : [];

    // Use modelName if available
    const table = err.meta?.modelName || err.meta?.table || "unknown";

    switch (err.code) {
      case "P2003": // Foreign key violation
      case "P2014": // Relation violation
        statusCode = 400;
        // Try to parse field from constraint name if target missing
        let field = metaTarget[0];
        let referencingModel = "related";
        if (!field && err.meta?.constraint) {
          const match = String(err.meta.constraint).match(
            /^(.+?)_(\w+)_fkey$/,
          );
          if (match) {
            referencingModel = match[1];
            field = match[2];
          }
        }
        message =
          req.method === "DELETE"
            ? `Cannot delete ${table} because ${referencingModel} record(s) still reference it via ${field || "this relation"}. Resolve those records first.`
            : field
              ? `Invalid reference: ${field} in ${table}. Referenced record does not exist.`
              : `Invalid reference in ${table}. Referenced record does not exist.`;
        break;

      case "P2002": // Unique constraint
        statusCode = 409;
        message = metaTarget.length
          ? `Duplicate value for ${metaTarget.join(", ")} in ${table}. Each must be unique.`
          : `Duplicate value found in ${table}.`;
        break;

      case "P2025": // Record not found
        statusCode = 404;
        message = `Resource not found in ${table}.`;
        break;

      case "P1000":
      case "P1001":
      case "P1002":
      case "P1008":
      case "P1017":
        statusCode = 503;
        message =
          "Database connection is temporarily unavailable. Cached features remain operational.";
        break;

      default:
        statusCode = 400;
        message =
          err.message || `Prisma error code ${err.code} occurred in ${table}.`;
    }
  } else if (err?.name === "PrismaClientValidationError") {
    statusCode = 400;

    // Split Prisma message into lines
    const lines = (err.message || "").split("\n");

    // Look for specific validation diagnostic lines
    const specificLines = lines
      .map((line: string) => line.replace(/[\r\n~]+/g, " ").trim())
      .filter(
        (line: string) =>
          line.startsWith("Argument `") ||
          line.startsWith("Unknown argument `") ||
          line.startsWith("Unknown field `") ||
          line.startsWith("Invalid value for `") ||
          line.includes("Unknown argument") ||
          line.includes("Unknown field")
      );

    if (specificLines.length) {
      const messages = specificLines.map((line: string) => {
        const missingMatch = line.match(/Argument `(\w+)` is missing/);
        if (missingMatch) return `${missingMatch[1]} is required`;

        const unknownArgMatch = line.match(/Unknown argument `(\w+)`/);
        if (unknownArgMatch) return line;

        const invalidMatch = line.match(/Argument `(\w+)`: (.+)/);
        if (invalidMatch) {
          return `${invalidMatch[1]}: ${invalidMatch[2].trim()}`;
        }

        return line;
      });
      message = messages.slice(0, 3).join("; ");
    } else {
      // Filter out code block and JSON payload dump lines
      const nonCodeLines = lines
        .map((l: string) => l.trim().replace(/[\r\n~]+/g, " "))
        .filter(
          (l: string) =>
            l.length > 0 &&
            !l.startsWith("Invalid `prisma.") &&
            !l.startsWith("-->") &&
            !l.startsWith("{") &&
            !l.startsWith("}") &&
            !l.startsWith("data:") &&
            !/^[a-zA-Z0-9_$]+:\s*(\{|\[|".*"|true|false|[0-9]+|null)/.test(l) &&
            l !== "Validation failed"
        );
      message =
        nonCodeLines.length > 0
          ? nonCodeLines.slice(0, 2).join("; ")
          : "Database validation failed";
    }
  }

  // --- Prisma init / Rust errors ---
  else if (err?.name === "PrismaClientInitializationError") {
    statusCode = 503;
    message =
      "Database connection is temporarily unavailable. Cached features remain operational.";
  } else if (err?.name === "PrismaClientRustPanicError") {
    statusCode = 500;
    message = "Internal database error (Prisma Rust panic)";
  } else if (
    ["ECONNREFUSED", "ETIMEDOUT", "EHOSTUNREACH", "ENOTFOUND"].includes(
      err?.code,
    )
  ) {
    statusCode = 503;
    message = "Database or network service temporarily unreachable.";
  }

  // --- Mongoose / MongoDB validation errors ---
  else if (err?.name === "ValidationError") {
    statusCode = 400;
    message = Object.values(err.errors || {})
      .map((e: any) => `${e.path || "field"}: ${e.message}`)
      .join("; ");
  }

  // --- Invalid ObjectId / CastError ---
  else if (err?.name === "CastError") {
    statusCode = 400;
    message = `Invalid ${err.path}: ${err.value}`;
  }

  // --- MongoDB duplicate key ---
  else if (err?.code === 11000) {
    const key = Object.keys(err.keyValue || {})[0] || "field";
    statusCode = 409;
    message = `Duplicate value: ${key} must be unique`;
  }

  // --- Invalid JSON payload ---
  else if (
    err instanceof SyntaxError &&
    (err as any).status === 400 &&
    "body" in (err as any)
  ) {
    statusCode = 400;
    message = "Invalid JSON payload";
  }
  // --- Default Error ---
  else if (err instanceof Error) {
    message = err.message;
  }

  // --- Determine status ---
  const status = statusCode >= 500 ? "error" : "fail";

  // --- Log detailed error for dev/support ---
  console.error(
    `[${new Date().toISOString()}] ${statusCode} - ${req.method} ${req.originalUrl}`,
    {
      message,
      code: statusCode,
      method: req.method,
      path: req.originalUrl,
      stack: err.stack,
      originalError: err,
    },
  );

  // --- Send clean frontend-friendly response ---
  res.status(statusCode).json({
    success: false,
    status,
    message,
    data: null,
    code: statusCode,
  });
};
