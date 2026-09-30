import config from "../config/index.js";

interface CacheItem {
  value: any;
  expiry: number | null;
}

/**
 * High-Performance L1 (In-Memory RAM LRU) Cache Manager
 * - Ultra-fast response (< 0.01ms)
 * - LRU Eviction Policy (Max 100,000 items)
 * - Configurable TTL per item
 */
export class L1Cache {
  private cache = new Map<string, CacheItem>();
  private maxItems: number;
  private defaultTtlSeconds: number;

  constructor(maxItems = 100000, defaultTtlSeconds = 300) {
    this.maxItems = maxItems;
    this.defaultTtlSeconds = defaultTtlSeconds;
  }

  get<T = any>(key: string): T | null {
    if (!config.USE_NODE_CACHE) return null;

    const item = this.cache.get(key);
    if (!item) return null;

    if (item.expiry && Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }

    // Refresh LRU order (delete and re-insert)
    this.cache.delete(key);
    this.cache.set(key, item);

    return item.value as T;
  }

  set(key: string, value: any, ttlSeconds: number = this.defaultTtlSeconds): void {
    if (!config.USE_NODE_CACHE) return;

    if (this.cache.size >= this.maxItems) {
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey) {
        this.cache.delete(oldestKey);
      }
    }

    const expiry = ttlSeconds ? Date.now() + ttlSeconds * 1000 : null;
    this.cache.set(key, { value, expiry });
  }

  del(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }
}

export const l1Cache = new L1Cache();
