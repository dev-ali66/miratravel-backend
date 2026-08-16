// access.middleware.js
import { StatusCodes } from "http-status-codes";
import catchAsync from "../utils/catch.async.js";
import ApiError from "../utils/api.error.js";
import { NextFunction, Request, Response } from "express";

export const accessMiddleware = (modelName: string) => {
  return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const method = req.method.toUpperCase();

    // Step 1: Action determination
    let action;
    if (method === "GET") {
      action = "READ";
    } else if (method === "DELETE") {
      action = "DELETE";
    } else {
      // POST / PUT / PATCH
      action = !!(req.body?.id || req.query?.id || req.params?.id)
        ? "UPDATE"
        : "CREATE";
    }

    // Attach action & modelName to request for service layer
    req.action = action;
    req.modelName = modelName;

    // Step 2: Basic RBAC check
    if (!req.auth || !req.auth.roles) {
      throw new ApiError("User roles not found", StatusCodes.FORBIDDEN);
    }

    const allPermissions = req.auth.roles.flatMap(
      (role: any) => role.permissions || [],
    );

    const matchedPermissions = allPermissions.filter((permission: any) => {
      if (!permission.resource) return false;
      const actionMatch =
        permission.action === action || permission.action === "*";
      const resourceMatch =
        permission.resource === "*" ||
        permission.resource.toLowerCase() === modelName.toLowerCase();
      return actionMatch && resourceMatch;
    });

    if (matchedPermissions.length === 0) {
      throw new ApiError(
        "Access Denied: role not allowed for this action",
        StatusCodes.FORBIDDEN,
      );
    }

    // Attach matched permissions to request
    req.matchedPermissions = matchedPermissions;

    next();
  });
};
