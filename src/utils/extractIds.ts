import { StatusCodes } from "http-status-codes";
import { Response } from "express";
import successResponse from "./success.response.js";

/**
 * Extract UUID & CUID IDs safely from any payload
 */
export const extractIds = (
  input: unknown,
  res: Response | null = null,
  emptyMessage: string = "No valid ID provided",
): string[] | null => {
  const ids = new Set<string>();

  // UUID (v4/v5 etc.)
  const uuidRegex =
    /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi;

  // CUID (example: ck8x7k2yq0000a1b2c3d4e5f6)
  const cuidRegex = /c[a-z0-9]{24}/gi;

  const walk = (val: unknown): void => {
    if (!val) return;

    if (typeof val === "string") {
      const uuidMatches = val.match(uuidRegex);
      const cuidMatches = val.match(cuidRegex);

      if (uuidMatches) uuidMatches.forEach((id) => ids.add(id));
      if (cuidMatches) cuidMatches.forEach((id) => ids.add(id));

      return;
    }

    if (Array.isArray(val)) {
      val.forEach(walk);
      return;
    }

    if (typeof val === "object") {
      const obj = val as Record<string, unknown>;

      if (typeof obj.id === "string") {
        const uuidMatches = obj.id.match(uuidRegex);
        const cuidMatches = obj.id.match(cuidRegex);

        if (uuidMatches) uuidMatches.forEach((id) => ids.add(id));
        if (cuidMatches) cuidMatches.forEach((id) => ids.add(id));
      }

      Object.values(obj).forEach(walk);
    }
  };

  walk(input);

  const result = Array.from(ids);

  if (res && result.length === 0) {
    successResponse({
      res,
      code: StatusCodes.OK,
      success: true,
      message: emptyMessage,
      data: null,
    });
    return null;
  }

  return result;
};
