import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import { pipeline } from "stream/promises";
import { Readable } from "stream";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

const CLOUDINARY_ROOT = path.resolve(process.cwd(), "../cloudinary");
const IMAGE_DIR = path.join(CLOUDINARY_ROOT, "image");
const VIDEO_DIR = path.join(CLOUDINARY_ROOT, "video");

for (const d of [IMAGE_DIR, VIDEO_DIR]) {
  if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
}

interface CloudinaryAsset {
  public_id: string;
  format: string;
  resource_type: string;
  bytes: number;
  secure_url: string;
  url: string;
}

function getTargetFilename(asset: CloudinaryAsset): string {
  const ext = asset.format ? `.${asset.format.toLowerCase()}` : path.extname(asset.secure_url) || "";
  let baseName = path.basename(asset.public_id);
  if (ext && !baseName.toLowerCase().endsWith(ext.toLowerCase())) {
    baseName += ext;
  }
  return baseName;
}

async function fetchAllCloudinaryAssets(): Promise<CloudinaryAsset[]> {
  const all: CloudinaryAsset[] = [];
  for (const rType of ["image", "video"]) {
    console.log(`📡 Fetching metadata for resource_type='${rType}' from Cloudinary...`);
    let nextCursor: string | undefined = undefined;
    let page = 0;
    do {
      page++;
      const res: any = await cloudinary.api.resources({
        resource_type: rType,
        max_results: 500,
        next_cursor: nextCursor,
      });
      const resources: CloudinaryAsset[] = res.resources || [];
      all.push(...resources);
      console.log(`   ✓ Page ${page}: retrieved ${resources.length} ${rType} assets.`);
      nextCursor = res.next_cursor;
    } while (nextCursor);
  }
  return all;
}

async function downloadSingleAsset(
  asset: CloudinaryAsset,
  targetDir: string,
  fileName: string,
  index: number,
  total: number
): Promise<{ status: "downloaded" | "skipped" | "failed"; error?: string }> {
  const fullPath = path.join(targetDir, fileName);

  if (fs.existsSync(fullPath)) {
    const stat = fs.statSync(fullPath);
    if (stat.size > 0) {
      return { status: "skipped" };
    }
  }

  const url = asset.secure_url || asset.url;
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "MIRA-Cloudinary-Sync/1.0" },
    });
    if (!res.ok || !res.body) {
      throw new Error(`HTTP ${res.status} ${res.statusText}`);
    }

    const fileStream = fs.createWriteStream(fullPath);
    // @ts-ignore
    const nodeStream = Readable.fromWeb(res.body);
    await pipeline(nodeStream, fileStream);

    console.log(`[${index + 1}/${total}] ⬇️ Downloaded: ${fileName} (${(asset.bytes / 1024).toFixed(1)} KB)`);
    return { status: "downloaded" };
  } catch (err: any) {
    console.error(`[${index + 1}/${total}] ❌ Failed: ${fileName} - ${err.message}`);
    return { status: "failed", error: err.message };
  }
}

async function main() {
  console.log("====================================================================");
  console.log("🚀 MIRA Travel — Cloudinary Full Mirror & Local Sync");
  console.log("====================================================================\n");

  const assets = await fetchAllCloudinaryAssets();
  console.log(`\n📦 Total Cloudinary assets fetched: ${assets.length}`);

  let skippedCount = 0;
  let downloadedCount = 0;
  let failedCount = 0;

  // Process in parallel with concurrency pool of 6
  const CONCURRENCY = 6;
  const queue = [...assets.entries()];

  const workers = Array.from({ length: CONCURRENCY }, async () => {
    while (queue.length > 0) {
      const item = queue.shift();
      if (!item) break;
      const [index, asset] = item;
      const targetDir = asset.resource_type === "video" ? VIDEO_DIR : IMAGE_DIR;
      const fileName = getTargetFilename(asset);

      const result = await downloadSingleAsset(asset, targetDir, fileName, index, assets.length);
      if (result.status === "downloaded") downloadedCount++;
      else if (result.status === "skipped") skippedCount++;
      else failedCount++;
    }
  });

  await Promise.all(workers);

  console.log("\n====================================================================");
  console.log("🎉 Cloudinary Sync Completed!");
  console.log(`   - Total Assets: ${assets.length}`);
  console.log(`   - Already Existed (Skipped): ${skippedCount}`);
  console.log(`   - Newly Downloaded: ${downloadedCount}`);
  console.log(`   - Failed: ${failedCount}`);
  console.log("====================================================================\n");

  // Verify file counts in directories
  const localImages = fs.readdirSync(IMAGE_DIR).filter(f => fs.statSync(path.join(IMAGE_DIR, f)).isFile());
  const localVideos = fs.readdirSync(VIDEO_DIR).filter(f => fs.statSync(path.join(VIDEO_DIR, f)).isFile());
  console.log(`📁 Local cloudinary/image files: ${localImages.length}`);
  console.log(`📁 Local cloudinary/video files: ${localVideos.length}`);
  console.log(`📁 Total local assets: ${localImages.length + localVideos.length}`);
}

main().catch(console.error);
