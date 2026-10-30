import fs from "fs";
import path from "path";
import sharp from "sharp";
import type { Request, Response, NextFunction } from "express";
import { getUploadsDir } from "../../shared/upload_local.service.js";

/**
 * ============================================================================
 * IMAGE OPTIMIZER CONFIGURATION (Adjustable Settings)
 * ============================================================================
 * You can adjust these values at any time to configure max dimensions,
 * default quality, fallback clamping, and Cloudflare/browser cache TTL.
 */
export const IMAGE_OPTIMIZER_CONFIG = {
  // Hard maximum boundary (4K = 3840px). Any value above this triggers clamping.
  MAX_ALLOWED_WIDTH: 3840,
  MAX_ALLOWED_HEIGHT: 3840,

  // Fallback clamping dimension when an excessive or malicious value is passed
  FALLBACK_CLAMP_WIDTH: 1440,
  FALLBACK_CLAMP_HEIGHT: 1440,

  // Minimum allowed dimension to prevent degenerate 0/negative requests
  MIN_ALLOWED_DIMENSION: 10,

  // Default quality if not specified (range: 1 - 100)
  DEFAULT_QUALITY: 100,

  // Default output format (WebP yields 70-80% smaller size than JPEG/PNG)
  DEFAULT_FORMAT: "webp" as const,

  // Supported output image formats
  SUPPORTED_FORMATS: ["webp", "jpeg", "jpg", "png", "avif"] as const,

  // Default fit / crop strategy when both width and height are provided
  DEFAULT_FIT: "cover" as const,

  // Supported fit modes: 'cover', 'contain', 'fill', 'inside', 'outside'
  SUPPORTED_FITS: ["cover", "contain", "fill", "inside", "outside"] as const,

  // Cache duration: 3 months (90 days in seconds = 7,776,000s)
  CACHE_MAX_AGE_SECONDS: 90 * 24 * 60 * 60,

  // High-fidelity upscaling configuration (Method 1: Lanczos3 + Smart Sharpening)
  ALLOW_UPSCALE: true,
  UPSCALE_KERNEL: "lanczos3" as const,
  ENABLE_SMART_SHARPEN: true,
};

export type SupportedFormat = (typeof IMAGE_OPTIMIZER_CONFIG.SUPPORTED_FORMATS)[number];
export type SupportedFit = (typeof IMAGE_OPTIMIZER_CONFIG.SUPPORTED_FITS)[number];

const MIME_MAP: Record<string, string> = {
  webp: "image/webp",
  jpeg: "image/jpeg",
  jpg: "image/jpeg",
  png: "image/png",
  avif: "image/avif",
};

export interface ImageOptimizationOptions {
  width?: number;
  height?: number;
  quality?: number;
  fit?: SupportedFit;
  format?: SupportedFormat;
}

/**
 * Parses and sanitizes image optimization query options according to CONFIG rules.
 */
export function parseOptimizationParams(query: Record<string, any>): ImageOptimizationOptions | null {
  const rawW = query.w ?? query.width;
  const rawH = query.h ?? query.height;
  const rawQ = query.q ?? query.quality;
  const rawFmt = query.fmt ?? query.format;
  const rawFit = query.fit;

  // If no resize or format params are supplied, return null to bypass processing
  if (rawW === undefined && rawH === undefined && rawQ === undefined && rawFmt === undefined) {
    return null;
  }

  let width: number | undefined;
  let height: number | undefined;

  if (rawW !== undefined) {
    const parsedW = parseInt(String(rawW), 10);
    if (!isNaN(parsedW) && parsedW >= IMAGE_OPTIMIZER_CONFIG.MIN_ALLOWED_DIMENSION) {
      if (parsedW > IMAGE_OPTIMIZER_CONFIG.MAX_ALLOWED_WIDTH) {
        // Clamp excessive/malicious widths down to 1440px
        width = IMAGE_OPTIMIZER_CONFIG.FALLBACK_CLAMP_WIDTH;
      } else {
        width = parsedW;
      }
    }
  }

  if (rawH !== undefined) {
    const parsedH = parseInt(String(rawH), 10);
    if (!isNaN(parsedH) && parsedH >= IMAGE_OPTIMIZER_CONFIG.MIN_ALLOWED_DIMENSION) {
      if (parsedH > IMAGE_OPTIMIZER_CONFIG.MAX_ALLOWED_HEIGHT) {
        // Clamp excessive/malicious heights down to 1440px
        height = IMAGE_OPTIMIZER_CONFIG.FALLBACK_CLAMP_HEIGHT;
      } else {
        height = parsedH;
      }
    }
  }

  // Quality sanitization (range: 10 - 100, default: 85)
  let quality = IMAGE_OPTIMIZER_CONFIG.DEFAULT_QUALITY;
  if (rawQ !== undefined) {
    const parsedQ = parseInt(String(rawQ), 10);
    if (!isNaN(parsedQ)) {
      quality = Math.max(10, Math.min(100, parsedQ));
    }
  }

  // Format sanitization
  let format: SupportedFormat = IMAGE_OPTIMIZER_CONFIG.DEFAULT_FORMAT;
  if (typeof rawFmt === "string") {
    const normalizedFmt = rawFmt.toLowerCase().trim() as SupportedFormat;
    if (IMAGE_OPTIMIZER_CONFIG.SUPPORTED_FORMATS.includes(normalizedFmt)) {
      format = normalizedFmt;
    }
  }

  // Fit mode sanitization
  let fit: SupportedFit = IMAGE_OPTIMIZER_CONFIG.DEFAULT_FIT;
  if (typeof rawFit === "string") {
    const normalizedFit = rawFit.toLowerCase().trim() as SupportedFit;
    if (IMAGE_OPTIMIZER_CONFIG.SUPPORTED_FITS.includes(normalizedFit)) {
      fit = normalizedFit;
    }
  }

  return { width, height, quality, format, fit };
}

/**
 * Resizes and transforms an image input (file path or Buffer) via Sharp.
 */
export async function transformImage(
  input: string | Buffer,
  options: ImageOptimizationOptions
): Promise<{ buffer: Buffer; mimeType: string }> {
  const { width, height, quality = IMAGE_OPTIMIZER_CONFIG.DEFAULT_QUALITY, format = "webp", fit = "cover" } = options;

  let pipeline = sharp(input, { failOn: "none" });

  // Apply responsive resize with high-fidelity Lanczos3 interpolation
  if (width || height) {
    pipeline = pipeline.resize({
      width,
      height,
      fit,
      withoutEnlargement: !IMAGE_OPTIMIZER_CONFIG.ALLOW_UPSCALE,
      kernel: sharp.kernel[IMAGE_OPTIMIZER_CONFIG.UPSCALE_KERNEL] || sharp.kernel.lanczos3,
    });

    if (IMAGE_OPTIMIZER_CONFIG.ENABLE_SMART_SHARPEN) {
      // Unsharp mask filter to maintain crisp edges when upscaled
      pipeline = pipeline.sharpen({
        sigma: 1.0,
        m1: 0.5,
        m2: 2.0,
      });
    }
  }

  // Apply format & compression
  switch (format) {
    case "webp":
      pipeline = pipeline.webp({ quality, effort: 4 });
      break;
    case "avif":
      pipeline = pipeline.avif({ quality, effort: 4 });
      break;
    case "png":
      pipeline = pipeline.png({ quality: Math.min(100, quality), compressionLevel: 8 });
      break;
    case "jpeg":
    case "jpg":
      pipeline = pipeline.jpeg({ quality, mozjpeg: true });
      break;
    default:
      pipeline = pipeline.webp({ quality, effort: 4 });
      break;
  }

  const buffer = await pipeline.toBuffer();
  const mimeType = MIME_MAP[format] || "image/webp";

  return { buffer, mimeType };
}

/**
 * Express Middleware that intercepts /uploads/* and /multimedia/uploads/* requests.
 * - If query params (w, h, q, fmt) are provided, resizes on the fly via Sharp and sets 3-month CDN cache.
 * - If no query params are provided, falls through to standard express.static.
 */
export const imageOptimizationMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  // Only process GET/HEAD requests
  if (req.method !== "GET" && req.method !== "HEAD") {
    return next();
  }

  const options = parseOptimizationParams(req.query);
  if (!options) {
    // No optimization params requested, bypass to express.static
    return next();
  }

  try {
    const uploadsDir = getUploadsDir();
    // Decode URI path (handles spaces, percent encoding)
    const decodedSubPath = decodeURIComponent(req.path).replace(/^\/+/, "");
    const absoluteFilePath = path.resolve(uploadsDir, decodedSubPath);

    // Security guardrail: prevent path traversal attacks (../)
    if (!absoluteFilePath.startsWith(uploadsDir)) {
      res.status(403).json({ success: false, message: "Forbidden path traversal" });
      return;
    }

    if (!fs.existsSync(absoluteFilePath)) {
      return next(); // Fall through to 404 handler or express.static
    }

    // Verify it is a valid image extension before passing to Sharp
    const ext = path.extname(absoluteFilePath).toLowerCase();
    const isImage = [".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif", ".tiff"].includes(ext);
    if (!isImage) {
      return next(); // Non-image assets (e.g. .mp4, .pdf) bypass optimizer
    }

    const { buffer, mimeType } = await transformImage(absoluteFilePath, options);

    // Send optimized response with Cloudflare-friendly 3-month cache header
    res.setHeader("Content-Type", mimeType);
    res.setHeader(
      "Cache-Control",
      `public, max-age=${IMAGE_OPTIMIZER_CONFIG.CACHE_MAX_AGE_SECONDS}, immutable`
    );
    res.setHeader("Vary", "Accept");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");

    res.status(200).send(buffer);
  } catch (error) {
    console.error("[ImageOptimizer] Error transforming image:", error);
    // On transformation error, gracefully fall back to express.static
    return next();
  }
};

/**
 * Dedicated API Route Handler for /api/v1/media/optimize?url=...&w=...&h=...
 * Supports both local upload paths and external/legacy Cloudinary image URLs.
 */
export const optimizeMediaRouteHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const targetUrl = req.query.url as string | undefined;
  if (!targetUrl) {
    res.status(400).json({ success: false, message: "Missing required 'url' parameter" });
    return;
  }

  const options = parseOptimizationParams(req.query) || {
    width: undefined,
    height: undefined,
    quality: IMAGE_OPTIMIZER_CONFIG.DEFAULT_QUALITY,
    format: IMAGE_OPTIMIZER_CONFIG.DEFAULT_FORMAT,
    fit: IMAGE_OPTIMIZER_CONFIG.DEFAULT_FIT,
  };

  try {
    let sourceBuffer: Buffer | string;

    // Check if targetUrl is an external/remote URL (e.g. legacy Cloudinary)
    if (targetUrl.startsWith("http://") || targetUrl.startsWith("https://")) {
      try {
        const fetchResponse = await fetch(targetUrl, {
          signal: AbortSignal.timeout(8000),
        });
        if (!fetchResponse.ok) {
          // If remote image fails, redirect to original URL as safe fallback
          res.redirect(302, targetUrl);
          return;
        }
        const arrayBuf = await fetchResponse.arrayBuffer();
        sourceBuffer = Buffer.from(arrayBuf);
      } catch {
        // Fallback: redirect to original URL
        res.redirect(302, targetUrl);
        return;
      }
    } else {
      // Local file path
      const uploadsDir = getUploadsDir();
      const sanitized = targetUrl.replace(/^\/+(multimedia\/)?uploads\/+/, "").replace(/^\/+/, "");
      const absoluteFilePath = path.resolve(uploadsDir, sanitized);

      if (!absoluteFilePath.startsWith(uploadsDir) || !fs.existsSync(absoluteFilePath)) {
        res.status(404).json({ success: false, message: "Image asset not found" });
        return;
      }
      sourceBuffer = absoluteFilePath;
    }

    const { buffer, mimeType } = await transformImage(sourceBuffer, options);

    res.setHeader("Content-Type", mimeType);
    res.setHeader(
      "Cache-Control",
      `public, max-age=${IMAGE_OPTIMIZER_CONFIG.CACHE_MAX_AGE_SECONDS}, immutable`
    );
    res.setHeader("Vary", "Accept");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");

    res.status(200).send(buffer);
  } catch (error) {
    console.error("[ImageOptimizer] Failed to optimize media route:", error);
    res.status(500).json({ success: false, message: "Failed to optimize image" });
  }
};
