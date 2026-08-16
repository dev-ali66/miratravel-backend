import { ipKeyGenerator } from "express-rate-limit";
import { createLimiter } from "./limiter.factory.js";

// 🌍 Global limiter
export const globalLimiter = createLimiter({
  windowMs: 60 * 1000,
  max: 100,
  prefix: "global",
});

// 🔐 Login limiter
export const loginLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  max: 5,
  prefix: "login",
  keyGenerator: (req: any) => ipKeyGenerator(req),
  skipSuccessfulRequests: true,
  message: {
    success: false,
    code: 429,
    message: "Too many failed login attempts. Please try again later.",
  },
});

// 🌐 Public API limiter
export const publicApiLimiter = createLimiter({
  windowMs: 60 * 1000,
  max: 100,
  prefix: "public",
  skip: (req: any) => req.path === "/api/products",
});

// 🌐 Public API limiter
export const passwordApiLimiter = createLimiter({
  windowMs: 60 * 1000,
  max: 1,
  prefix: "public",
  skip: (req: any) => req.path === "/api/products",
});

// 🔢 OTP limiter
export const otpApiLimiter = createLimiter({
  windowMs: 60 * 1000,
  max: 5,
  prefix: "otp",
});

// 👑 Admin limiter
export const adminLimiter = createLimiter({
  windowMs: 60 * 1000,
  max: 100,
  prefix: "admin",
  keyGenerator: (req: any) => req.auth?.id || ipKeyGenerator(req),
});
