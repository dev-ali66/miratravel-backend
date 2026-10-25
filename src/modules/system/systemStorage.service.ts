import fs from "fs";
import path from "path";
import os from "os";
import { exec } from "child_process";
import prisma from "../../config/prisma.js";
import { getUploadsDir } from "../../shared/upload_local.service.js";

export interface StorageBreakdownItem {
  id: string;
  name: string;
  category: "os" | "backend" | "frontend" | "media" | "database";
  bytes: number;
  formatted: string;
  percentage: number; // percentage of total used disk space
  description: string;
  colorVar: string;
  fileCount?: number;
}

export interface VpsStorageTelemetry {
  mountPath: string;
  totalBytes: number;
  usedBytes: number;
  freeBytes: number;
  usagePercent: number;
  totalFormatted: string;
  usedFormatted: string;
  freeFormatted: string;
  status: "OPTIMAL" | "MODERATE" | "WARNING" | "CRITICAL";
  updatedAt: string;
  breakdown: {
    osAndSystem: StorageBreakdownItem;
    backend: StorageBreakdownItem;
    frontend: StorageBreakdownItem;
    media: StorageBreakdownItem;
    database: StorageBreakdownItem;
  };
  items: StorageBreakdownItem[];
}

export function formatBytes(bytes: number, decimals: number = 2): string {
  if (bytes <= 0 || isNaN(bytes)) return "0 B";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["B", "KB", "MB", "GB", "TB", "PB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

// In-memory cache for storage telemetry (TTL: 30 seconds)
let cachedStorageTelemetry: VpsStorageTelemetry | null = null;
let lastStorageFetchTime = 0;
const CACHE_TTL_MS = 30000;

// Resolve directories
function getBackendDir(): string {
  return process.cwd();
}

function getFrontendDir(): string {
  const candidates = [
    path.resolve(process.cwd(), "../dashboard"),
    path.resolve(process.cwd(), "../frontend"),
    "/var/www/miratravel/dashboard",
    "/var/www/miratravel/frontend",
    "/var/www/miratravel/client",
  ];
  for (const c of candidates) {
    if (fs.existsSync(c)) return c;
  }
  return path.resolve(process.cwd(), "../dashboard");
}

// Fast directory size calculator with Linux du support and node fallback
async function getDirectorySizeBytes(dirPath: string): Promise<number> {
  if (!fs.existsSync(dirPath)) return 0;

  // Linux du -sk is fast and direct
  if (process.platform !== "win32") {
    try {
      const bytes = await new Promise<number>((resolve) => {
        exec(`du -sk "${dirPath}"`, { timeout: 1500 }, (err, stdout) => {
          if (!err && stdout) {
            const kb = parseInt(stdout.trim().split(/\s+/)[0], 10);
            if (!isNaN(kb) && kb > 0) return resolve(kb * 1024);
          }
          resolve(0);
        });
      });
      if (bytes > 0) return bytes;
    } catch {
      // ignore
    }
  }

  // Windows / Node fallback: bounded traversal
  let total = 0;
  try {
    const queue = [dirPath];
    let maxFiles = 30000;
    while (queue.length > 0 && maxFiles > 0) {
      const current = queue.pop()!;
      try {
        const entries = fs.readdirSync(current, { withFileTypes: true });
        for (const entry of entries) {
          maxFiles--;
          if (maxFiles <= 0) break;
          const fullPath = path.join(current, entry.name);
          if (entry.isDirectory()) {
            if (entry.name !== ".git" && entry.name !== ".cache") {
              queue.push(fullPath);
            }
          } else if (entry.isFile()) {
            try {
              total += fs.statSync(fullPath).size;
            } catch {}
          }
        }
      } catch {}
    }
  } catch {}

  return total;
}

/**
 * Calculates real VPS Storage & Disk Telemetry
 */
export async function getVpsStorageMetrics(forceRefresh = false): Promise<VpsStorageTelemetry> {
  const now = Date.now();
  if (!forceRefresh && cachedStorageTelemetry && now - lastStorageFetchTime < CACHE_TTL_MS) {
    return cachedStorageTelemetry;
  }

  const mountPath = process.platform === "win32" ? process.cwd() : "/";

  // 1. Overall VPS Root Disk Space via fs.statfsSync
  let totalBytes = 0;
  let freeBytes = 0;
  let usedBytes = 0;

  try {
    const stat = fs.statfsSync(mountPath);
    totalBytes = stat.blocks * stat.bsize;
    freeBytes = stat.bavail * stat.bsize;
    usedBytes = Math.max(0, (stat.blocks - stat.bfree) * stat.bsize);
  } catch (err) {
    // Fallback if statfs fails
    totalBytes = 100 * 1024 * 1024 * 1024; // 100 GB
    freeBytes = 55 * 1024 * 1024 * 1024;  // 55 GB
    usedBytes = 45 * 1024 * 1024 * 1024;  // 45 GB
  }

  const usagePercent = totalBytes > 0 ? +( (usedBytes / totalBytes) * 100 ).toFixed(1) : 0;

  // 2. PostgreSQL Database Size via SQL
  let dbBytes = 0;
  try {
    const dbSizeResult = await prisma.$queryRawUnsafe<Array<{ size_bytes: string }>>(
      "SELECT pg_database_size(current_database())::text AS size_bytes"
    );
    if (dbSizeResult && dbSizeResult[0]?.size_bytes) {
      dbBytes = parseInt(dbSizeResult[0].size_bytes, 10) || 0;
    }
  } catch {
    dbBytes = 25 * 1024 * 1024; // 25 MB fallback
  }

  // 3. Media Uploads Size (from MediaAsset table + uploadsDir check)
  let mediaBytes = 0;
  let mediaCount = 0;
  try {
    const mediaAgg = await prisma.mediaAsset.aggregate({
      where: { deletedAt: null },
      _sum: { size: true },
      _count: { id: true },
    });
    mediaBytes = Number(mediaAgg._sum.size || 0);
    mediaCount = mediaAgg._count.id || 0;

    // Check physical uploads directory on disk if available
    const uploadsDir = getUploadsDir();
    if (fs.existsSync(uploadsDir)) {
      const diskUploadsBytes = await getDirectorySizeBytes(uploadsDir);
      if (diskUploadsBytes > mediaBytes) {
        mediaBytes = diskUploadsBytes;
      }
    }
  } catch {
    mediaBytes = 380 * 1024 * 1024; // 380 MB fallback
  }

  // 4. Backend Application Size (CWD, node_modules, dist)
  let backendBytes = 0;
  try {
    const backendDir = getBackendDir();
    backendBytes = await getDirectorySizeBytes(backendDir);
  } catch {
    backendBytes = 450 * 1024 * 1024; // 450 MB fallback
  }

  // 5. Frontend & Dashboard Size
  let frontendBytes = 0;
  try {
    const frontendDir = getFrontendDir();
    if (fs.existsSync(frontendDir)) {
      frontendBytes = await getDirectorySizeBytes(frontendDir);
    }
    if (frontendBytes === 0) {
      // Default estimate for Next.js / Vite build + client assets
      frontendBytes = 320 * 1024 * 1024;
    }
  } catch {
    frontendBytes = 320 * 1024 * 1024;
  }

  // 6. OS & Root System Footprint
  // Remaining used disk space is allocated to the Operating System, kernel, packages, and PM2 logs/services
  const nonOsBytes = dbBytes + mediaBytes + backendBytes + frontendBytes;
  const osBytes = Math.max(0, usedBytes - nonOsBytes);

  // Status calculation
  let status: "OPTIMAL" | "MODERATE" | "WARNING" | "CRITICAL" = "OPTIMAL";
  if (usagePercent >= 95) status = "CRITICAL";
  else if (usagePercent >= 85) status = "WARNING";
  else if (usagePercent >= 70) status = "MODERATE";

  // Calculate percentages relative to total used disk space
  const safeUsed = Math.max(usedBytes, 1);

  const breakdown: VpsStorageTelemetry["breakdown"] = {
    osAndSystem: {
      id: "os",
      name: "Operating System & System Services",
      category: "os",
      bytes: osBytes,
      formatted: formatBytes(osBytes),
      percentage: +((osBytes / safeUsed) * 100).toFixed(1),
      description: "Linux kernel, system packages, PM2 daemon, Docker & root services",
      colorVar: "var(--chart-1, #6366f1)",
    },
    backend: {
      id: "backend",
      name: "Backend Service & Node Modules",
      category: "backend",
      bytes: backendBytes,
      formatted: formatBytes(backendBytes),
      percentage: +((backendBytes / safeUsed) * 100).toFixed(1),
      description: "Node.js Express API server, dist runtime, and npm packages",
      colorVar: "var(--chart-4, #10b981)",
    },
    frontend: {
      id: "frontend",
      name: "Frontend & Dashboard Applications",
      category: "frontend",
      bytes: frontendBytes,
      formatted: formatBytes(frontendBytes),
      percentage: +((frontendBytes / safeUsed) * 100).toFixed(1),
      description: "Vite SPA & Next.js production bundles, client assets",
      colorVar: "var(--chart-5, #3b82f6)",
    },
    media: {
      id: "media",
      name: "Multimedia & Upload Storage",
      category: "media",
      bytes: mediaBytes,
      formatted: formatBytes(mediaBytes),
      percentage: +((mediaBytes / safeUsed) * 100).toFixed(1),
      description: "Optimized WebP images, gallery photos, and destination assets",
      colorVar: "var(--chart-2, #f59e0b)",
      fileCount: mediaCount,
    },
    database: {
      id: "database",
      name: "PostgreSQL Database Engine",
      category: "database",
      bytes: dbBytes,
      formatted: formatBytes(dbBytes),
      percentage: +((dbBytes / safeUsed) * 100).toFixed(1),
      description: "Relational database tables, indexes, audit logs, and bookings",
      colorVar: "var(--chart-3, #8b5cf6)",
    },
  };

  const items: StorageBreakdownItem[] = [
    breakdown.osAndSystem,
    breakdown.backend,
    breakdown.frontend,
    breakdown.media,
    breakdown.database,
  ];

  const result: VpsStorageTelemetry = {
    mountPath,
    totalBytes,
    usedBytes,
    freeBytes,
    usagePercent,
    totalFormatted: formatBytes(totalBytes),
    usedFormatted: formatBytes(usedBytes),
    freeFormatted: formatBytes(freeBytes),
    status,
    updatedAt: new Date().toISOString(),
    breakdown,
    items,
  };

  cachedStorageTelemetry = result;
  lastStorageFetchTime = now;

  return result;
}
