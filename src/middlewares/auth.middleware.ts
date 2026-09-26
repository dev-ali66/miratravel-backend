import { StatusCodes } from "http-status-codes";
import ApiError from "../utils/api.error.js";
import AuthHelper from "../utils/auth.helper.js";
import catchAsync from "../utils/catch.async.js";
import { NextFunction, Request, Response } from "express";
import config from "../config/index.js";
import * as jwt from "jsonwebtoken";
// Pre-decode JWT for rate limiter
export const preDecode = (req: Request, res: Response, next: NextFunction) => {
  let token;

  // Get token from cookies or headers or preDecode
  if (req.cookies?.accessToken) {
    token = req.cookies.accessToken;
  } else if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    // no token → limiter fallback: IP-based
    return next();
  }
  req.token = token;
  try {
    const decoded: any = AuthHelper.verifyAccessToken(token);
    req.auth = decoded;
  } catch (err: any) {
    return next();
  }

  next();
};

// Protect middleware - verifies if user is authenticated
export const protect = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    let token = req.token;

    // fallback to cookies/headers if preDecode didn't run
    if (!token) {
      if (req.cookies?.accessToken) {
        token = req.cookies.accessToken;
      } else if (
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")
      ) {
        token = req.headers.authorization.split(" ")[1];
      }
    }

    if (!token) {
      throw new ApiError(
        "You are not logged in. Please login to access this resource",
        StatusCodes.UNAUTHORIZED,
      );
    }

    // Decode token
    let decoded;
    try {
      decoded = AuthHelper.verifyAccessToken(token);
    } catch (error) {
      throw new ApiError("Invalid or expired token", StatusCodes.UNAUTHORIZED);
    }

    if (!decoded) {
      throw new ApiError(
        "User belonging to this token no longer exists",
        StatusCodes.UNAUTHORIZED,
      );
    }

    req.auth = decoded; // attach full user with roles and permissions
    next();
  },
);

// Authorize middleware - checks if user has required roles
export const authorize = (...allowedRoles: any[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.auth || !req.auth.roles) {
      throw new ApiError(
        "User roles not found. Please login again.",
        StatusCodes.UNAUTHORIZED,
      );
    }

    // Check if user has any of the allowed roles
    const hasRole = allowedRoles.includes(req.auth.roles);
    if (!hasRole) {
      throw new ApiError(
        `Access denied. Only ${allowedRoles.join(", ")} can access this resource`,
        StatusCodes.FORBIDDEN,
      );
    }

    next();
  };
};

// Check if user is admin (ADMIN or SUPER_ADMIN)
export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.auth || !req.auth.roles) {
    throw new ApiError(
      "User roles not found. Please login again.",
      StatusCodes.UNAUTHORIZED,
    );
  }

  const isAdminRole = req.auth.roles === "admin";

  if (!isAdminRole) {
    throw new ApiError(
      "Access denied. Admin privileges required.",
      StatusCodes.FORBIDDEN,
    );
  }

  next();
};

// Check if user is super admin
export const isSuperAdmin = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (!req.auth || !req.auth.roles) {
    throw new ApiError(
      "User roles not found. Please login again.",
      StatusCodes.UNAUTHORIZED,
    );
  }

  const isSuperAdminRole = req.auth.roles.includes("SUPER_ADMIN");

  if (!isSuperAdminRole) {
    throw new ApiError(
      "Access denied. Super Admin privileges required.",
      StatusCodes.FORBIDDEN,
    );
  }

  next();
};

// ✅ 1. checkBlockedIP
export const checkBlockedIP = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  // TODO: implement temporary + permanent blocklist
  // Should block only for this user/device/IP
  next();
};

// ✅ 2. checkBruteForce
export const checkBruteForce = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  // TODO: track failed login attempts per user/device
  // Lock account if threshold exceeded
  next();
};

// ✅ 3. checkDeviceTrust
export const checkDeviceTrust = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  // TODO: check if device is trusted
  // Skip 2FA if trusted, else enforce extra verification
  next();
};