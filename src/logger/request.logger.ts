import crypto from "crypto";
import { NextFunction, Request, Response } from "express";
import { logger } from "./logger.logger.js";
import config from "../config/index.js";

export const requestLogger = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const start = process.hrtime.bigint();
  const cpuStart = process.cpuUsage();
  const requestId =
    req.headers["x-request-id"]?.toString() ?? crypto.randomUUID();
  const correlationId =
    req.headers["x-correlation-id"]?.toString() ?? requestId;
  const traceId = req.headers["traceparent"]?.toString() ?? requestId;
  (req as any).requestId = requestId;
  (req as any).correlationId = correlationId;
  (req as any).traceId = traceId;

  logger.info("Incoming Request", {
    requestId,
    correlationId,
    traceId,

    method: req.method,
    url: req.originalUrl,
    protocol: req.protocol,
    httpVersion: req.httpVersion,

    ip: req.ip,
    proxyIp: req.headers["x-forwarded-for"] ?? null,

    hostname: req.hostname,

    userAgent: req.get("user-agent"),
    origin: req.get("origin"),
    referer: req.get("referer"),

    contentType: req.get("content-type"),
    contentLength: req.get("content-length"),

    params: req.params,
    query: req.query,
    body: req.body,

    authenticated: !!req.auth,

    user: {
      id: req.auth?.id ?? null,
      role:
        req.auth?.roles?.map((role: any) => ({
          id: role.id,
          name: role.name,
        })) ?? [],
    },

    sessionId:
      req.auth?.sessionId ??
      req.cookies?.connect_sid ??
      req.cookies?.sessionId ??
      null,

    jwtId: req.auth?.jti ?? req.auth?.jwtId ?? null,

    geo: {
      country: req.headers["cf-ipcountry"] ?? null,
      city: req.headers["cf-ipcity"] ?? null,
      region: req.headers["cf-region"] ?? null,
    },

    apiVersion: config.API_VERSION,

    environment: config.NODE_ENV,
  });

  res.on("finish", () => {
    const end = process.hrtime.bigint();
    const responseTime = Number(end - start) / 1_000_000;
    const contentLength = Number(res.getHeader("content-length") || 0);
    const responseSizeKB = (contentLength / 1024).toFixed(2);
    const memory = process.memoryUsage();

    logger.success("Request Completed", {
      requestId,
      correlationId,
      traceId,
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      responseTime: `${responseTime.toFixed(2)}ms`,
      responseSize: `${responseSizeKB} KB`,
      memoryUsage: {
        rss: `${(memory.rss / 1024 / 1024).toFixed(2)} MB`,
        heapUsed: `${(memory.heapUsed / 1024 / 1024).toFixed(2)} MB`,
        heapTotal: `${(memory.heapTotal / 1024 / 1024).toFixed(2)} MB`,
        external: `${(memory.external / 1024 / 1024).toFixed(2)} MB`,
      },
      cpuUsage: process.cpuUsage(cpuStart),
      environment: config.NODE_ENV,
    });
  });

  next();
};
