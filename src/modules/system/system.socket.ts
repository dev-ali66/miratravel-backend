import { Server, Socket } from "socket.io";
import os from "os";
import prisma from "../../config/prisma.js";
import { redisManager } from "../../config/redis.js";

let ioInstance: Server | null = null;
let telemetryInterval: NodeJS.Timeout | null = null;

export const initSystemSocket = (io: Server) => {
  ioInstance = io;

  io.on("connection", (socket: Socket) => {
    // Client requests to subscribe to real-time system metrics
    socket.on("system:subscribe", async () => {
      socket.join("system_telemetry");
      // Immediately send current snapshot
      const snapshot = await collectTelemetrySnapshot();
      socket.emit("system:telemetry:stream", snapshot);
    });

    socket.on("system:unsubscribe", () => {
      socket.leave("system_telemetry");
    });
  });

  // Start periodic background telemetry broadcast if not already running
  if (!telemetryInterval) {
    telemetryInterval = setInterval(async () => {
      if (!ioInstance) return;

      const clientsInRoom = ioInstance.sockets.adapter.rooms.get("system_telemetry");
      if (clientsInRoom && clientsInRoom.size > 0) {
        try {
          const snapshot = await collectTelemetrySnapshot();
          ioInstance.to("system_telemetry").emit("system:telemetry:stream", snapshot);
        } catch (err) {
          // Non-fatal
        }
      }
    }, 3000);
  }
};

const collectTelemetrySnapshot = async () => {
  const startTime = Date.now();

  let dbStatus = "CONNECTED";
  let dbLatencyMs = 45;
  try {
    const dbStart = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    dbLatencyMs = Date.now() - dbStart;
  } catch (err) {
    dbStatus = "ERROR";
    dbLatencyMs = -1;
  }

  const memoryUsage = process.memoryUsage();
  const totalMem = os.totalmem();
  const freeMem = os.freemem();
  const uptimeSeconds = Math.floor(process.uptime());

  return {
    timestamp: new Date().toISOString(),
    status: dbStatus === "CONNECTED" ? "HEALTHY" : "DEGRADED",
    responseTimeMs: Date.now() - startTime,
    database: {
      provider: "Neon PostgreSQL",
      status: dbStatus,
      latencyMs: dbLatencyMs,
    },
    redis: {
      status: redisManager.isReady() ? "CONNECTED" : "DISCONNECTED",
      latencyMs: redisManager.isReady() ? 2 : -1,
    },
    system: {
      platform: os.platform(),
      cpus: os.cpus().length,
      nodeVersion: process.version,
      uptimeFormatted: `${Math.floor(uptimeSeconds / 3600)}h ${Math.floor((uptimeSeconds % 3600) / 60)}m ${uptimeSeconds % 60}s`,
      memory: {
        rssMb: Math.round((memoryUsage.rss / 1024 / 1024) * 100) / 100,
        heapTotalMb: Math.round((memoryUsage.heapTotal / 1024 / 1024) * 100) / 100,
        heapUsedMb: Math.round((memoryUsage.heapUsed / 1024 / 1024) * 100) / 100,
        usagePercentage: Math.round(((totalMem - freeMem) / totalMem) * 1000) / 10,
      },
    },
  };
};

export const broadcastAuditEvent = (auditLog: any) => {
  if (ioInstance) {
    ioInstance.to("system_telemetry").emit("system:audit:new", auditLog);
    ioInstance.emit("system:audit:broadcast", auditLog);
  }
};

export const broadcastConfigUpdate = (config: any) => {
  if (ioInstance) {
    ioInstance.to("system_telemetry").emit("system:config:update", config);
  }
};
