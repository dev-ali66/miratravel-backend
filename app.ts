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
import { bootstraps } from "./bootstraps.js";
import { redisManager } from "./src/config/redis.js";
import { setupSwagger } from "./src/docs/swagger/swagger.js";
import { responseLogger } from "./src/logger/response.logger.js";
import { requestLogger } from "./src/logger/request.logger.js";

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

// Socket.IO authentication middleware
export interface AuthenticatedSocket extends Socket {
  user?: any;
}
io.use((socket: AuthenticatedSocket, next) => {
  const token =
    socket.handshake.auth?.token ||
    socket.handshake.headers?.authorization?.split(" ")[1];
  if (!token) {
    return next(new Error("Authentication required"));
  }
  try {
    if (!config.JWT_ACCESS_TOKEN_SECRET) {
      throw new Error("JWT secret not configured");
    }
    const decoded = jwt.verify(token, config.JWT_ACCESS_TOKEN_SECRET);
    socket.user = decoded;
    next();
  } catch (err: any) {
    return next(new Error("Invalid or expired token"));
  }
});

// Listen for connections
io.on("connection", (socket) => {
  //console.log("Socket connected:", socket.id);

  // Join ticket room
  socket.on("joinTicket", (ticketId) => {
    socket.join(ticketId);
    //console.log(`Socket ${socket.id} joined ticket ${ticketId}`);
  });

  socket.on("disconnect", () => {
    //console.log("Socket disconnected:", socket.id);
  });
});

app.use(compression());
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true, limit: "2mb" }));
app.use(cookieParser());
app.use(globalLimiter);

if (isProduction) app.set("trust proxy", 1);

app.get("/api/v1/health", (req, res) => {
  const healthData = {
    code: 200,
    success: true,
    status: "UP",
    service: "Poli Server",
    redis: redisManager.isReady() ? "connected" : "disconnected",
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
bootstraps(app);
setupSwagger(app);
app.use(notFoundMiddleware);
app.use(globalErrorHandler);

export { httpServer, PORT };
export default app;
