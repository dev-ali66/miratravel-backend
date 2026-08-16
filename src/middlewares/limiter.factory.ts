import rateLimit, { ipKeyGenerator } from "express-rate-limit";
import RedisStore from "rate-limit-redis";
import { redisManager } from "../config/redis.js";

export const createLimiter = (options: any) => {
  const baseConfig = {
    windowMs: options.windowMs,
    max: options.max,
    skip: options.skip || (() => false),

    keyGenerator: (req: any) =>
      req.auth?.id ||
      (options.keyGenerator ? options.keyGenerator(req) : ipKeyGenerator(req)),

    message: options.message || {
      success: false,
      code: 429,
      message: "Too many requests",
    },

    standardHeaders: true,
    legacyHeaders: false,
  };

  const client = redisManager.getClient();

  // 🔥 Redis available
  if (client && redisManager.isReady()) {
    return rateLimit({
      ...baseConfig,
      store: new RedisStore({
        // safer ioredis compatibility
        sendCommand: (command: string, ...args: string[]) => {
          return (client as any).call(command, ...args);
        },
        prefix: options.prefix || "rl",
      }),
    });
  }

  // ⚠️ fallback (memory)
  return rateLimit(baseConfig);
};
