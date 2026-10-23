import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";
import { pipeline } from "stream/promises";
import { Readable } from "stream";

// Load backend .env configuration
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

// Target folder: Poli Full stack/cloudinary
const BACKUP_ROOT = path.resolve(process.cwd(), "../cloudinary");
const IMAGE_DIR = path.join(BACKUP_ROOT, "image");
const VIDEO_DIR = path.join(BACKUP_ROOT, "video");
const FILES_DIR = path.join(BACKUP_ROOT, "files");

// Ensure the 3 clean target folders exist
for (const dir of [IMAGE_DIR, VIDEO_DIR, FILES_DIR]) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

interface CloudinaryResource {
  public_id: string;
  format: string;
  version: number;
  resource_type: string;
  type: string;
  created_at: string;
  bytes: number;
  width?: number;
  height?: number;
  url: string;
  secure_url: string;
}

interface ManifestEntry {
  public_id: string;
  resource_type: string;
  format: string;
  bytes: number;
  secure_url: string;
  local_file_path: string;
  status: "downloaded" | "skipped_exists" | "failed";
  error?: string;
  downloaded_at: string;
}

const formatBytes = (bytes: number): string => {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
};

/**
 * Fetch all resources from Cloudinary API with pagination across images, videos, and raw files.
 */
async function fetchAllResources(): Promise<CloudinaryResource[]> {
  const resourceTypes = ["image", "video", "raw"];
  const allResources: CloudinaryResource[] = [];

  for (const rType of resourceTypes) {
    console.log(`\n🔍 Fetching list of all '${rType}' assets from Cloudinary...`);
    let nextCursor: string | undefined = undefined;
    let pageCount = 0;

    do {
      pageCount++;
      try {
        const response: any = await cloudinary.api.resources({
          resource_type: rType,
          max_results: 500,
          next_cursor: nextCursor,
        });

        const resources: CloudinaryResource[] = response.resources || [];
        allResources.push(...resources);
        console.log(
          `   ✓ Page ${pageCount}: Found ${resources.length} ${rType} assets (Total so far: ${allResources.length})`,
        );

        nextCursor = response.next_cursor;
      } catch (err: any) {
        console.warn(`   ⚠️ Warning fetching ${rType} assets:`, err.message);
        break;
      }
    } while (nextCursor);
  }

  return allResources;
}

/**
 * Downloads a single file with stream pipeline directly into flat image, video, or files folder.
 */
async function downloadAsset(
  resource: CloudinaryResource,
  index: number,
  total: number,
): Promise<ManifestEntry> {
  const ext = resource.format
    ? `.${resource.format.toLowerCase()}`
    : path.extname(resource.secure_url) || "";

  // Extract pure file basename (no subfolders)
  let baseName = path.basename(resource.public_id);
  if (ext && !baseName.toLowerCase().endsWith(ext.toLowerCase())) {
    baseName += ext;
  }

  // Target directory strictly based on resource type
  const category =
    resource.resource_type === "image"
      ? "image"
      : resource.resource_type === "video"
        ? "video"
        : "files";

  const targetDir =
    category === "image" ? IMAGE_DIR : category === "video" ? VIDEO_DIR : FILES_DIR;

  const localFilePath = path.join(targetDir, baseName);

  const manifestItem: ManifestEntry = {
    public_id: resource.public_id,
    resource_type: resource.resource_type,
    format: resource.format || "",
    bytes: resource.bytes || 0,
    secure_url: resource.secure_url,
    local_file_path: path.relative(path.resolve(process.cwd(), ".."), localFilePath),
    status: "downloaded",
    downloaded_at: new Date().toISOString(),
  };

  // Check if already downloaded
  if (fs.existsSync(localFilePath)) {
    const stat = fs.statSync(localFilePath);
    if (stat.size > 0) {
      console.log(
        `[${index + 1}/${total}] ⏩ SKIPPED (Already exists): ${category}/${baseName} (${formatBytes(stat.size)})`,
      );
      manifestItem.status = "skipped_exists";
      return manifestItem;
    }
  }

  const url = resource.secure_url || resource.url;
  console.log(
    `[${index + 1}/${total}] ⬇️ Downloading: ${category}/${baseName} (${formatBytes(resource.bytes)})...`,
  );

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "MIRA-Travel-Cloudinary-Backup/1.0",
      },
    });

    if (!response.ok || !response.body) {
      throw new Error(`HTTP ${response.status} ${response.statusText}`);
    }

    const fileStream = fs.createWriteStream(localFilePath);
    // @ts-ignore
    const nodeStream = Readable.fromWeb(response.body);
    await pipeline(nodeStream, fileStream);

    console.log(
      `[${index + 1}/${total}] ✅ SAVED: ${category}/${baseName} (${formatBytes(resource.bytes)})`,
    );
    return manifestItem;
  } catch (err: any) {
    console.error(`[${index + 1}/${total}] ❌ FAILED: ${category}/${baseName} - ${err.message}`);
    manifestItem.status = "failed";
    manifestItem.error = err.message;
    return manifestItem;
  }
}

/**
 * Concurrency runner for parallel downloads
 */
async function runWithConcurrency<T, R>(
  items: T[],
  limit: number,
  fn: (item: T, index: number, total: number) => Promise<R>,
): Promise<R[]> {
  const results: R[] = [];
  let currentIndex = 0;

  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (currentIndex < items.length) {
      const index = currentIndex++;
      const item = items[index];
      const result = await fn(item, index, items.length);
      results[index] = result;
    }
  });

  await Promise.all(workers);
  return results;
}

/**
 * Removes any leftover empty subfolders
 */
function cleanupEmptySubfolders(dir: string) {
  if (!fs.existsSync(dir)) return;
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    if (entry.isDirectory()) {
      const subDir = path.join(dir, entry.name);
      // Don't delete the 3 root category folders
      if (subDir !== IMAGE_DIR && subDir !== VIDEO_DIR && subDir !== FILES_DIR) {
        cleanupEmptySubfolders(subDir);
        try {
          const remaining = fs.readdirSync(subDir);
          if (remaining.length === 0) {
            fs.rmdirSync(subDir);
          }
        } catch {
          // ignore
        }
      }
    }
  }
}

async function main() {
  console.log("==============================================================");
  console.log("🚀 MIRA TRAVEL - CLOUDINARY FLAT MEDIA BACKUP TOOL");
  console.log("==============================================================");
  console.log(`Cloud Name : ${process.env.CLOUDINARY_CLOUD_NAME}`);
  console.log(`Backup Dir : ${BACKUP_ROOT}`);
  console.log(`Categories : image, video, files (Flat Structure, No Subfolders)`);
  console.log("==============================================================");

  const startTime = Date.now();

  // 1. Fetch resources
  const resources = await fetchAllResources();
  console.log(`\n📦 Total Cloudinary Assets Discovered: ${resources.length}`);

  if (resources.length === 0) {
    console.log("No assets found in Cloudinary to backup. Exiting.");
    return;
  }

  const totalBytes = resources.reduce((acc, r) => acc + (r.bytes || 0), 0);
  console.log(`📊 Estimated Total Asset Size: ${formatBytes(totalBytes)}`);
  console.log(`⚡ Concurrency: 5 simultaneous downloads\n`);

  // 2. Download all assets with concurrency of 5 directly to flat folders
  const manifestItems = await runWithConcurrency(resources, 5, downloadAsset);

  // 3. Cleanup any leftover empty folders inside BACKUP_ROOT
  cleanupEmptySubfolders(BACKUP_ROOT);
  cleanupEmptySubfolders(IMAGE_DIR);
  cleanupEmptySubfolders(VIDEO_DIR);
  cleanupEmptySubfolders(FILES_DIR);

  // 4. Save Manifest file
  const manifestPath = path.join(BACKUP_ROOT, "manifest.json");
  const manifestData = {
    backup_timestamp: new Date().toISOString(),
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    structure: "flat",
    total_assets: resources.length,
    downloaded: manifestItems.filter((m) => m.status === "downloaded").length,
    skipped_existing: manifestItems.filter((m) => m.status === "skipped_exists").length,
    failed: manifestItems.filter((m) => m.status === "failed").length,
    total_size: formatBytes(totalBytes),
    assets: manifestItems,
  };

  fs.writeFileSync(manifestPath, JSON.stringify(manifestData, null, 2), "utf-8");

  const elapsedSeconds = ((Date.now() - startTime) / 1000).toFixed(1);

  const imageFiles = fs.readdirSync(IMAGE_DIR).filter((f) => fs.statSync(path.join(IMAGE_DIR, f)).isFile());
  const videoFiles = fs.readdirSync(VIDEO_DIR).filter((f) => fs.statSync(path.join(VIDEO_DIR, f)).isFile());
  const filesFiles = fs.readdirSync(FILES_DIR).filter((f) => fs.statSync(path.join(FILES_DIR, f)).isFile());

  console.log("\n==============================================================");
  console.log("🎉 CLOUDINARY FLAT BACKUP COMPLETED!");
  console.log("==============================================================");
  console.log(`📁 cloudinary/image/ : ${imageFiles.length} files`);
  console.log(`📁 cloudinary/video/ : ${videoFiles.length} files`);
  console.log(`📁 cloudinary/files/ : ${filesFiles.length} files`);
  console.log(`Newly Downloaded     : ${manifestData.downloaded}`);
  console.log(`Already Existed      : ${manifestData.skipped_existing}`);
  console.log(`Failed Downloads     : ${manifestData.failed}`);
  console.log(`Total Size           : ${manifestData.total_size}`);
  console.log(`Manifest File        : ${manifestPath}`);
  console.log(`Elapsed Time         : ${elapsedSeconds}s`);
  console.log("==============================================================\n");
}

main().catch((err) => {
  console.error("Fatal error during backup:", err);
  process.exit(1);
});
