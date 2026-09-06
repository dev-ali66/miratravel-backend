import { logger } from "./logger.logger.js";

export const redisLogger = {
  connecting() {
    logger.info("Redis Connecting...");
  },

  connected() {
    logger.success("Redis Connected");
  },

  disabled(reason: string) {
    logger.warn("Redis Disabled", {
      reason,
    });
  },
  tcpConnected() {
    logger.info("Redis TCP Connected");
  },

  waiting() {
    logger.warn("Redis Waiting For Connection");
  },

  reconnected() {
    logger.success("Redis Reconnected");
  },
  reconnecting(delay: number) {
    logger.warn("Redis Reconnecting", {
      retryAfterMs: delay,
    });
  },

  disconnected() {
    logger.warn("Redis Disconnected");
  },

  connectionEnded() {
    logger.warn("Redis Connection Ended");
  },

  error(error: any) {
    logger.error("Redis Error", {
      name: error?.name,
      message: error?.message,
      code: error?.code ?? null,
      stack: process.env.NODE_ENV === "development" ? error?.stack : undefined,
    });
  },

  command(command: string, key?: string) {
    logger.debug("Redis Command", {
      command,
      key,
    });
  },

  hit(key: string) {
    logger.debug("Redis Cache Hit", {
      key,
    });
  },

  miss(key: string) {
    logger.debug("Redis Cache Miss", {
      key,
    });
  },

  set(key: string, ttl?: number) {
    logger.debug("Redis Cache Set", {
      key,
      ttl,
    });
  },

  del(key: string) {
    logger.debug("Redis Cache Delete", {
      key,
    });
  },
};
