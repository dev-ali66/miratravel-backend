import Redis from "ioredis";
import config from "./index.js";
import { redisLogger } from "../logger/redis.logger.js";

class RedisManager {
  private client: InstanceType<typeof Redis.default> | null = null;
  private initialized = false;

  connect(): void {
    if (this.initialized) return;

    if (!config.USE_REDIS) {
      redisLogger.disabled(
        "Redis service is disabled via config (USE_REDIS=false)",
      );
      return;
    }

    this.initialized = true;

    if (!config.REDIS_HOST || !config.REDIS_PORT) {
      redisLogger.disabled("Redis configuration missing");
      return;
    }

    let firstConnection = true;

    redisLogger.connecting();

    this.client = new Redis.default({
      host: config.REDIS_HOST,
      port: Number(config.REDIS_PORT),
      connectTimeout: config.REDIS_TIMEOUT || 5000,
      maxRetriesPerRequest: 3,

      retryStrategy: (times: number) => {
        // Stop reconnecting after 5 attempts to prevent infinite log spamming
        if (times > 5) {
          redisLogger.error(
            new Error(
              "Redis retry limit reached (5 attempts). Stopping reconnection loop.",
            ),
          );
          return null; // Returning null stops ioredis from retrying endlessly
        }
        return Math.min(times * 1000, 5000);
      },
    });

    this.client.on("ready", () => {
      if (firstConnection) {
        redisLogger.connected();
        firstConnection = false;
      } else {
        redisLogger.reconnected();
      }
    });

    this.client.on("wait", () => {
      redisLogger.waiting();
    });

    this.client.on("reconnecting", (delay: number) => {
      redisLogger.reconnecting(delay);
    });

    this.client.on("close", () => {
      redisLogger.disconnected();
    });

    this.client.on("end", () => {
      redisLogger.connectionEnded();
    });

    this.client.on("error", (err) => {
      // Log error cleanly, do not crash application
      redisLogger.error(err);
    });
  }

  getClient(): InstanceType<typeof Redis.default> | null {
    if (!config.USE_REDIS || !this.client) return null;

    // Return client only when status is ready
    if (this.client.status !== "ready") {
      return null;
    }

    return this.client;
  }

  isReady(): boolean {
    return Boolean(config.USE_REDIS && this.client?.status === "ready");
  }

  async disconnect(): Promise<void> {
    if (!this.client) return;

    try {
      await this.client.quit();
    } catch {
      // ignore
    } finally {
      this.client = null;
      this.initialized = false;
    }
  }
}

export const redisManager = new RedisManager();

// import Redis from "ioredis";
// import config from "./index.js";
// import { redisLogger } from "../logger/redis.logger.js";

// class RedisManager {
//   private client: InstanceType<typeof Redis.default> | null = null;

//   async connect(): Promise<void> {
//     if (this.client) return;

//     if (!config.REDIS_HOST || !config.REDIS_PORT) {
//       redisLogger.disabled("Redis configuration missing");
//       return;
//     } let firstConnection = true;

//     redisLogger.connecting();

//     this.client = new Redis.default({
//       host: config.REDIS_HOST,
//       port: config.REDIS_PORT,
//       connectTimeout: config.REDIS_TIMEOUT || 5000,

//       retryStrategy: (times) => {
//         return Math.min(times * 1000, 5000);
//       },
//     });

//     return new Promise<void>((resolve, reject) => {
//       this.client!.on("ready", () => {
//         if (firstConnection) {
//           redisLogger.connected();
//           firstConnection = false;
//         } else {
//           redisLogger.reconnected();
//         }

//         resolve();
//       });

//       this.client!.on("wait", () => {
//         redisLogger.waiting();
//       });

//       this.client!.on("reconnecting", (delay: any) => {
//         redisLogger.reconnecting(delay);
//       });

//       this.client!.on("close", () => {
//         redisLogger.disconnected();
//       });

//       this.client!.on("end", () => {
//         redisLogger.connectionEnded();
//       });

//       this.client!.once("error", (err) => {
//         redisLogger.error(err);
//         reject(err);
//       });
//     });
//   }

//   getClient(): InstanceType<typeof Redis.default> | null {
//     return this.client;
//   }

//   isReady(): boolean {
//     return this.client?.status === "ready";
//   }

//   async disconnect() {
//     if (!this.client) return;

//     await this.client.quit();

//     this.client = null;
//   }
// }

// export const redisManager = new RedisManager();
