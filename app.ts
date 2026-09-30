import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import hpp from "hpp";
import helmet from "helmet";
import { xss } from "express-xss-sanitizer";
import cookieParser from "cookie-parser";
import compression from "compression";
import os from "os";
import { createServer } from "http";
import { Server, Socket } from "socket.io";
import { globalLimiter } from "./src/middlewares/limiter.middleware.js";
import {
  globalErrorHandler,
  notFoundMiddleware,
} from "./src/middlewares/error.middleware.js";
import jwt from "jsonwebtoken";
import config from "./src/config/index.js";
import { requestProfilerMiddleware } from "./src/utils/perfomance.tester.js";
import { bootStapHttps } from "./bootStrapsHttp.js";
import { bootStapSocket } from "./bootsStrapsSocket.js";
import { redisManager } from "./src/config/redis.js";
import { rabbitMQManager } from "./src/config/rabbitmq.js";
import { nodeCacheManager } from "./src/config/nodecache.js";
import { setupSwagger } from "./src/docs/swagger/swagger.js";
import { responseLogger } from "./src/logger/response.logger.js";
import { requestLogger } from "./src/logger/request.logger.js";

import prisma from "./src/config/prisma.js";

dotenv.config({ quiet: true });

const app = express();

const httpServer = createServer(app);

const isProduction = config.NODE_ENV === "production";
const PORT = config.PORT || 5010;

const allowedOrigins = config.CORS_ALLOWED_ORIGINS;

const socketAllowedOrigins = config.SOCKET_ALLOWED_ORIGINS
  ? config.SOCKET_ALLOWED_ORIGINS
  : allowedOrigins;

app.use(requestProfilerMiddleware);
// 🔒 CSP-Compliant Architecture
app.use(express.static("public"));
app.use(
  helmet({
    contentSecurityPolicy: isProduction ? undefined : false,
    crossOriginEmbedderPolicy: isProduction ? undefined : false,
    hsts: isProduction
      ? { maxAge: 31536000, includeSubDomains: true, preload: true }
      : false,
    frameguard: { action: "sameorigin" },
    hidePoweredBy: true,
    xssFilter: true,
    noSniff: true,
  }),
);

app.use(hpp());
app.use(xss());

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE"],
    optionsSuccessStatus: 204,
  }),
);

export const io = new Server(httpServer, {
  cors: {
    origin: socketAllowedOrigins,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  },
  pingTimeout: 60000,
  pingInterval: 25000,
  transports: ["websocket", "polling"],
});

// Initialize socket modules through bootStapSocket
bootStapSocket(io);

app.use(compression());
app.use(
  express.json({
    limit: "2mb",
    verify: (req: any, _res, buf) => {
      req.rawBody = buf;
    },
  })
);
app.use(express.urlencoded({ extended: true, limit: "2mb" }));
app.use(cookieParser());
app.use(globalLimiter);

if (isProduction) app.set("trust proxy", 1);

app.get("/favicon.ico", (_req, res) => {
  res.status(204).end();
});

app.get("/api/v1/health", async (_req, res) => {
  let dbStatus = "disconnected";
  try {
    await prisma.$queryRaw`SELECT 1`;
    dbStatus = "connected";
  } catch {
    dbStatus = "disconnected";
  }

  const isServerHealthy =
    dbStatus === "connected" &&
    (!config.USE_REDIS || redisManager.isReady()) &&
    (!config.USE_RABBITMQ || rabbitMQManager.isReady());

  const healthData = {
    code: 200,
    success: true,
    status: isServerHealthy ? "UP" : "DEGRADED",
    service: "Poli Server",
    database: dbStatus,
    redis: config.USE_REDIS
      ? redisManager.isReady()
        ? "connected"
        : "disconnected"
      : "disabled",
    rabbitmq: config.USE_RABBITMQ
      ? rabbitMQManager.isReady()
        ? "connected"
        : "disconnected"
      : "disabled",
    nodecache: config.USE_NODE_CACHE ? "enabled" : "disabled",
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    hostname: os.hostname(),
    environment: config.NODE_ENV || "development",
    platform: os.platform(),
    nodeVersion: process.version,
  };

  res.status(200).json(healthData);
});

app.get("/api/v1/", (req, res) => {
  res.status(200).json({
    code: 200,
    success: true,
    message: "Welcome to  API Server 🚀",
    documentation: `${req.protocol}://${req.get("host")}/api/docs` || "",

    version: config.API_VERSION || "1.0.0",
  });
});
app.use(requestLogger);
app.use(responseLogger);
bootStapHttps(app);
setupSwagger(app);
app.use(notFoundMiddleware);
app.use(globalErrorHandler);

export { httpServer, PORT };
export default app;
