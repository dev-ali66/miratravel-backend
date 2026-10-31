import crypto from "crypto";
import fs from "fs";
import multer from "multer";
import path from "path";
import config from "../../config/index.js";
import { getUploadsDir } from "../../shared/upload_local.service.js";

const MIME_EXTENSION_MAP: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/jpg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
  "image/svg+xml": ".svg",
  "image/avif": ".avif",
  "image/heic": ".heic",
  "image/heif": ".heic",
  "video/mp4": ".mp4",
  "video/webm": ".webm",
  "video/quicktime": ".mov",
  "video/x-msvideo": ".avi",
  "audio/mpeg": ".mp3",
  "audio/mp3": ".mp3",
  "audio/wav": ".wav",
  "audio/ogg": ".ogg",
  "audio/webm": ".webm",
  "application/pdf": ".pdf",
};

/**
 * Fast zero-dependency image dimension extractor supporting JPEG, PNG, GIF, WebP.
 */
export function extractImageDimensions(
  buffer: Buffer,
  mimeType: string
): { width?: number; height?: number } {
  try {
    if (!mimeType.startsWith("image/") || buffer.length < 10) {
      return {};
    }

    // 1. PNG
    if (buffer.length >= 24 && buffer.toString("ascii", 12, 16) === "IHDR") {
      const width = buffer.readUInt32BE(16);
      const height = buffer.readUInt32BE(20);
      return { width, height };
    }

    // 2. GIF
    if (buffer.length >= 10 && buffer.toString("ascii", 0, 3) === "GIF") {
      const width = buffer.readUInt16LE(6);
      const height = buffer.readUInt16LE(8);
      return { width, height };
    }

    // 3. WebP
    if (
      buffer.length >= 30 &&
      buffer.toString("ascii", 0, 4) === "RIFF" &&
      buffer.toString("ascii", 8, 12) === "WEBP"
    ) {
      const chunkHeader = buffer.toString("ascii", 12, 16);
      if (chunkHeader === "VP8 " && buffer.length >= 30) {
        const width = buffer.readUInt16LE(26) & 0x3fff;
        const height = buffer.readUInt16LE(28) & 0x3fff;
        return { width, height };
      } else if (chunkHeader === "VP8L" && buffer.length >= 25) {
        const b0 = buffer[21];
        const b1 = buffer[22];
        const b2 = buffer[23];
        const b3 = buffer[24];
        const width = 1 + (((b1 & 0x3f) << 8) | b0);
        const height = 1 + (((b3 & 0x0f) << 10) | (b2 << 2) | ((b1 & 0xc0) >> 6));
        return { width, height };
      } else if (chunkHeader === "VP8X" && buffer.length >= 30) {
        const width = 1 + (buffer[24] | (buffer[25] << 8) | (buffer[26] << 16));
        const height = 1 + (buffer[27] | (buffer[28] << 8) | (buffer[29] << 16));
        return { width, height };
      }
    }

    // 4. JPEG
    if (buffer.length >= 4 && buffer[0] === 0xff && buffer[1] === 0xd8) {
      let offset = 2;
      while (offset < buffer.length - 8) {
        if (buffer[offset] !== 0xff) break;
        const marker = buffer[offset + 1];
        const len = buffer.readUInt16BE(offset + 2);
        if (
          (marker >= 0xc0 && marker <= 0xc3) ||
          (marker >= 0xc5 && marker <= 0xc7) ||
          (marker >= 0xc9 && marker <= 0xcb) ||
          (marker >= 0xcd && marker <= 0xcf)
        ) {
          const height = buffer.readUInt16BE(offset + 5);
          const width = buffer.readUInt16BE(offset + 7);
          return { width, height };
        }
        offset += 2 + len;
      }
    }

    // 5. SVG
    if (
      mimeType.includes("svg") ||
      buffer.toString("utf8", 0, Math.min(buffer.length, 100)).includes("<svg")
    ) {
      const svgText = buffer.toString("utf8", 0, Math.min(buffer.length, 4096));
      const widthMatch = svgText.match(/\bwidth=["']?(\d+(?:\.\d+)?)/i);
      const heightMatch = svgText.match(/\bheight=["']?(\d+(?:\.\d+)?)/i);
      if (widthMatch && heightMatch) {
        return {
          width: Math.round(parseFloat(widthMatch[1])),
          height: Math.round(parseFloat(heightMatch[1])),
        };
      }
      const viewBoxMatch = svgText.match(
        /\bviewBox=["']?[\d\.\-]+\s+[\d\.\-]+\s+([\d\.\-]+)\s+([\d\.\-]+)/i
      );
      if (viewBoxMatch) {
        return {
          width: Math.round(parseFloat(viewBoxMatch[1])),
          height: Math.round(parseFloat(viewBoxMatch[2])),
        };
      }
    }
  } catch {
    // If dimension parsing fails, safely ignore
  }

  return {};
}

/**
 * Computes SHA-256 hash of a buffer.
 */
export function computeSha256(buffer: Buffer): string {
  return crypto.createHash("sha256").update(buffer).digest("hex");
}

/**
 * Computes SHA-256 hash of a file on disk via read stream with minimal RAM footprint.
 */
export function computeFileStreamSha256(filePath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash("sha256");
    const stream = fs.createReadStream(filePath);
    stream.on("data", (chunk) => hash.update(chunk));
    stream.on("end", () => resolve(hash.digest("hex")));
    stream.on("error", (err) => reject(err));
  });
}

/**
 * Returns the temporary uploads directory path, creating it if necessary.
 */
export const getTempUploadsDir = (): string => {
  const uploadsDir = getUploadsDir();
  const tempDir = path.join(uploadsDir, ".tmp");
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }
  return tempDir;
};

/**
 * Generates canonical file metadata and disk storage paths.
 */
export function generateMediaStoragePath(
  originalName: string,
  mimeType: string
): { fileName: string; filePath: string; fileUrl: string } {
  const uploadsDir = getUploadsDir();

  let ext = path.extname(originalName || "").toLowerCase();
  if (!ext || ext.length < 2) {
    ext = MIME_EXTENSION_MAP[mimeType] || ".bin";
  }

  const rawBase = path.basename(originalName || "media", path.extname(originalName || ""));
  const cleanBase = rawBase
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 50);

  const randomHash = crypto.randomBytes(4).toString("hex");
  const fileName = `${Date.now()}-${randomHash}-${cleanBase || "media"}${ext}`;
  const filePath = path.join(uploadsDir, fileName);

  const baseUrl = (
    config.MEDIA_BASE_URL ||
    (config.NODE_ENV === "production" ? "https://api.miratravel.nl" : "http://localhost:5010")
  ).replace(/\/+$/, "");

  const fileUrl = `${baseUrl}/multimedia/uploads/${fileName}`;

  return { fileName, filePath, fileUrl };
}

/**
 * Disk-backed Multer storage streaming incoming files to temporary NVMe disk.
 * Eliminates RAM buffer bloat and protects against PM2 RSS out-of-memory crashes.
 */
export const mediaDiskStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, getTempUploadsDir());
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname || "").toLowerCase();
    const randomHash = crypto.randomBytes(6).toString("hex");
    cb(null, `tmp-${Date.now()}-${randomHash}${ext}`);
  },
});

/**
 * Temporary disk-streamed Multer uploader handling single & bulk uploads up to 200MB.
 */
export const mediaMulterUpload = multer({
  storage: mediaDiskStorage,
  limits: {
    fileSize: 200 * 1024 * 1024, // 200 MB
  },
  fileFilter: (_req, file, cb) => {
    // Allow images, videos, audio, and pdfs
    if (
      file.mimetype.startsWith("image/") ||
      file.mimetype.startsWith("video/") ||
      file.mimetype.startsWith("audio/") ||
      file.mimetype === "application/pdf"
    ) {
      cb(null, true);
    } else {
      cb(new Error(`Unsupported file type: ${file.mimetype}`));
    }
  },
});
