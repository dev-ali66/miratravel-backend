import { l1Cache } from "./l1Cache.helper.js";
import { redisManager } from "../config/redis.js";
import config from "../config/index.js";

/**
 * Invalidate both L1 (In-Memory RAM) and L2 (Redis Centralized) caches
 * when records are created, updated, or deleted.
 */
export const invalidateModelCache = async (modelName: string): Promise<void> => {
  // 1. Invalidate L1 Cache (Clear RAM)
  l1Cache.clear();

  // 2. Invalidate L2 Cache (Flush Redis keys associated with model tag)
  if (config.USE_REDIS && redisManager.isReady()) {
    try {
      const redis = redisManager.getClient();
      if (redis) {
        const tagKey = `tag:${modelName}`;
        const keys = await redis.smembers(tagKey);

        if (keys && keys.length > 0) {
          await redis.del(...keys);
        }

        await redis.del(tagKey);
      }
    } catch (err) {
      console.warn(
        `Redis L2 cache invalidation warning for model '${modelName}':`,
        err,
      );
    }
  }
};
