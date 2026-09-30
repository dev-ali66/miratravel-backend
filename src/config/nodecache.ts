import config from "./index.js";
import { logger } from "../logger/logger.logger.js";

class NodeCacheManager {
  private cacheStore: Map<string, { value: any; expiry: number | null }> =
    new Map();

  constructor() {
    if (!config.USE_NODE_CACHE) {
      // Disabled by default
    }
  }

  isReady(): boolean {
    return Boolean(config.USE_NODE_CACHE);
  }

  get<T = any>(key: string): T | null {
    if (!config.USE_NODE_CACHE) return null;

    const item = this.cacheStore.get(key);
    if (!item) return null;

    if (item.expiry && Date.now() > item.expiry) {
      this.cacheStore.delete(key);
      return null;
    }

    return item.value as T;
  }

  set(key: string, value: any, ttlSeconds?: number): void {
    if (!config.USE_NODE_CACHE) return;

    const expiry = ttlSeconds ? Date.now() + ttlSeconds * 1000 : null;
    this.cacheStore.set(key, { value, expiry });
  }

  del(key: string): void {
    if (!config.USE_NODE_CACHE) return;
    this.cacheStore.delete(key);
  }

  flush(): void {
    if (!config.USE_NODE_CACHE) return;
    this.cacheStore.clear();
  }
}

export const nodeCacheManager = new NodeCacheManager();
