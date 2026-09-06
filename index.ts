import { httpServer, io, PORT } from "./app.js";
import config from "./src/config/index.js";
import { redisManager } from "./src/config/redis.js";
import { logger } from "./src/logger/logger.logger.js";
import prisma from "./src/config/prisma.js";

const SHUTDOWN_TIMEOUT = 15000;
const isDevelopment = config.NODE_ENV === "development";

let isShuttingDown = false;

type ShutdownSignal = "SIGINT" | "SIGTERM" | "SIGHUP" | string;

const gracefulShutdown = async (signal: ShutdownSignal) => {
  if (isShuttingDown) {
    logger.warn("Shutdown already in progress...");
    return;
  }

  isShuttingDown = true;

  logger.warn(`${signal} received. Initiating graceful shutdown...`);

  const shutdownTimer = setTimeout(() => {
    logger.error("Shutdown timeout exceeded. Forcing exit.");
    process.exit(1);
  }, SHUTDOWN_TIMEOUT);

  shutdownTimer.unref();

  try {
    await new Promise<void>((resolve, reject) => {
      httpServer.close((err) => {
        if (err) {
          logger.error("Error closing HTTP server", err);
          reject(err);
        } else {
          logger.success("HTTP server closed");
          resolve();
        }
      });
    });

    await new Promise<void>((resolve) => {
      io.close(() => {
        logger.success("Socket.IO server closed");
        resolve();
      });
    });

    await prisma.$disconnect();
    logger.success("Database connection closed");

    const redis = redisManager.getClient();

    if (redis) {
      await redis.quit();
      logger.success("Redis connection closed");
    }

    // await rabbit.disconnect();

    clearTimeout(shutdownTimer);

    logger.success("Graceful shutdown completed successfully");

    process.exit(0);
  } catch (error: any) {
    logger.error("Error during graceful shutdown", error);

    clearTimeout(shutdownTimer);

    process.exit(1);
  }
};

const startServer = async () => {
  try {
    logger.info("Connecting to database...");

    await prisma.$connect();
    await prisma.$queryRaw`SELECT 1`;

    await redisManager.connect();
    // await rabbit.connect();

    logger.success("Database connected successfully");

    httpServer.listen(PORT, "127.0.0.1", () => {
      logger.success("Server started successfully", {
        url: `http://localhost:${PORT}`,
        docs: `http://localhost:${PORT}/api/docs`,
        environment: config.NODE_ENV,
        pid: process.pid,
        node: process.version,
      });
    });

    httpServer.on("error", (error: any) => {
      switch (error.code) {
        case "EADDRINUSE":
          logger.error(`Port ${PORT} is already in use`);
          break;

        case "EACCES":
          logger.error(`Port ${PORT} requires elevated privileges`);
          break;

        default:
          logger.error("HTTP Server Error", error);
      }

      process.exit(1);
    });
  } catch (error: any) {
    logger.error("Failed to start server", error);

    if (isDevelopment && error?.stack) {
      logger.debug(error.stack);
    }

    process.exit(1);
  }
};

process.on("uncaughtException", (error) => {
  logger.error("UNCAUGHT EXCEPTION", error);

  if (isDevelopment && error.stack) {
    logger.debug(error.stack);
  }

  gracefulShutdown("Uncaught Exception");
});

process.on("unhandledRejection", (reason) => {
  logger.error("UNHANDLED REJECTION", reason);

  gracefulShutdown("Unhandled Rejection");
});

const signals: ShutdownSignal[] = ["SIGINT", "SIGTERM", "SIGHUP"];

signals.forEach((signal) => process.on(signal, () => gracefulShutdown(signal)));

if (isDevelopment) {
  process.on("warning", (warning) => {
    logger.warn("Process Warning", {
      name: warning.name,
      message: warning.message,
      stack: warning.stack,
    });
  });

  process.on("multipleResolves", (type, promise, reason) => {
    logger.warn("Multiple Resolves Detected", {
      type,
      promise,
      reason,
    });
  });
}

startServer();
