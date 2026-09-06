import Redis from "ioredis";
import config from "./index.js";
import { redisLogger } from "../logger/redis.logger.js";

class RedisManager {
  private client: InstanceType<typeof Redis.default> | null = null;
  private initialized = false;

  connect(): void {
    if (this.initialized) return;
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

      retryStrategy: (times: number) => {
        // Retry every 1s, max 5s
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
      // শুধু log করবে, app crash করবে না
      redisLogger.error(err);
    });
  }

  getClient(): InstanceType<typeof Redis.default> | null {
    if (!this.client) return null;

    // শুধু ready হলে client return করবে
    if (this.client.status !== "ready") {
      return null;
    }

    return this.client;
  }

  isReady(): boolean {
    return this.client?.status === "ready";
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
