import fs from "fs";
import path from "path";
import crypto from "crypto";
import config from "../config/index.js";

export interface LocalUploadResult {
  url: string;
  secure_url: string;
  fileName: string;
  size: number;
  mimeType: string;
  field?: string;
}

const MIME_EXTENSION_MAP: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/jpg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
  "image/svg+xml": ".svg",
  "image/avif": ".avif",
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
  "application/msword": ".doc",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": ".docx",
};

/**
 * Ensures the uploads directory exists on disk and returns its absolute path.
 */
export const getUploadsDir = (): string => {
  let uploadDirEnv =
    config.UPLOAD_DIR ||
    (process.platform === "linux"
      ? "/var/www/miratravel/multimedia/uploads"
      : "multimedia/uploads");

  if (process.platform === "win32" && uploadDirEnv.startsWith("/var/")) {
    uploadDirEnv = "multimedia/uploads";
  }

  const dir = path.isAbsolute(uploadDirEnv)
    ? uploadDirEnv
    : path.resolve(process.cwd(), uploadDirEnv);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return dir;
};

/**
 * Uploads a file buffer directly to VPS local persistent disk storage.
 */
export const uploadFilesToLocalStorage = async (
  buffer: Buffer,
  mimeType: string,
  fieldName: string = "file",
  originalName: string = "upload",
): Promise<LocalUploadResult> => {
  const uploadsDir = getUploadsDir();

  // Deduce file extension
  let ext = path.extname(originalName || "").toLowerCase();
  if (!ext || ext.length < 2) {
    ext = MIME_EXTENSION_MAP[mimeType] || ".bin";
  }

  // Clean original base name
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

  await fs.promises.writeFile(filePath, buffer);

  const baseUrl = (
    config.MEDIA_BASE_URL ||
    (config.NODE_ENV === "production" ? "https://api.miratravel.nl" : "http://localhost:5010")
  ).replace(/\/+$/, "");

  const fileUrl = `${baseUrl}/multimedia/uploads/${fileName}`;

  return {
    url: fileUrl,
    secure_url: fileUrl,
    fileName,
    size: buffer.length,
    mimeType,
    field: fieldName,
  };
};

/**
 * Safely deletes a file from local VPS disk storage.
 */
export const deleteFromLocalStorage = async (url: string): Promise<boolean> => {
  try {
    if (!url || typeof url !== "string") return false;

    let fileNameWithQuery = "";
    if (url.includes("/multimedia/uploads/")) {
      fileNameWithQuery = url.substring(url.indexOf("/multimedia/uploads/") + 20);
    } else if (url.includes("/uploads/")) {
      fileNameWithQuery = url.substring(url.indexOf("/uploads/") + 9);
    } else {
      return false;
    }

    const fileName = fileNameWithQuery.split("?")[0];
    const safeFileName = path.basename(fileName);

    const uploadsDir = getUploadsDir();
    const filePath = path.join(uploadsDir, safeFileName);

    if (fs.existsSync(filePath)) {
      await fs.promises.unlink(filePath);
      return true;
    }
    return false;
  } catch (err) {
    console.warn("Failed to delete local file:", url, err);
    return false;
  }
};
