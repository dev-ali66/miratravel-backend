/**
 * MIRA Travel — Cloudinary to VPS Storage & Database URL Cutover
 * 
 * 1. Loads cloudinary/manifest.json and builds complete mapping from Cloudinary URLs to local VPS URLs.
 * 2. Migrates all entity records (Location, Journey, Experience, Story, CmsPage, SiteSettings),
 *    replacing every Cloudinary URL with canonical VPS URL (https://api.miratravel.nl/multimedia/uploads/<canonical_filename>).
 * 3. Clears and re-backfills MediaAsset and MediaReference tables directly from the clean entities and local disk files.
 * 4. Verifies 0 Cloudinary URLs remain in the PostgreSQL database.
 */

import fs from "fs";
import path from "path";
import crypto from "crypto";
import prisma from "../src/config/prisma.js";
import { extractMediaReferences, ExtractedMediaReference } from "../src/utils/mediaExtractor.js";
import { getUploadsDir } from "../src/shared/upload_local.service.js";

const VPS_BASE_URL = "https://api.miratravel.nl/multimedia/uploads";

const MIME_MAP: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".avif": "image/avif",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".ogg": "video/ogg",
  ".mov": "video/quicktime",
};

interface ManifestAsset {
  public_id: string;
  resource_type: string;
  format: string;
  bytes: number;
  secure_url: string;
  local_file_path: string;
  status: string;
  canonical_file?: string;
}

/**
 * Executes a database operation with retries to withstand transient network drops.
 */
async function withRetry<T = any>(op: () => Promise<T>, retries = 3, delayMs = 1500): Promise<T> {
  let lastError: any;
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await op();
    } catch (err: any) {
      lastError = err;
      if (attempt < retries) {
        console.warn(`      ⚠️ Network hiccup (${err?.code || err?.message}). Retrying in ${delayMs}ms... (Attempt ${attempt}/${retries})`);
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }
  }
  throw lastError;
}

/**
 * Computes SHA-256 hash and size of a file if it exists locally.
 */
function getFileMetadata(filePath: string): { hash: string | null; size: number } {
  try {
    if (fs.existsSync(filePath)) {
      const buffer = fs.readFileSync(filePath);
      const hash = crypto.createHash("sha256").update(buffer).digest("hex");
      return { hash, size: buffer.length };
    }
  } catch {
    // ignore
  }
  return { hash: null, size: 0 };
}

/**
 * Derives canonical filename from any Cloudinary URL or manifest entry.
 */
function buildUrlResolver(manifestAssets: ManifestAsset[]) {
  const urlMap = new Map<string, string>();
  const fileMap = new Map<string, string>();
  const publicIdMap = new Map<string, string>();

  for (const asset of manifestAssets) {
    const canonical = asset.canonical_file || path.basename(asset.local_file_path);
    if (asset.secure_url) {
      urlMap.set(asset.secure_url.trim(), canonical);
      urlMap.set(asset.secure_url.trim().replace(/^https:/, "http:"), canonical);
    }
    if (asset.local_file_path) {
      const baseName = path.basename(asset.local_file_path);
      fileMap.set(baseName.toLowerCase(), canonical);
    }
    if (asset.public_id) {
      publicIdMap.set(asset.public_id.toLowerCase(), canonical);
    }
  }

  return function resolveTargetFilename(url: string): string {
    const trimmed = url.trim();
    if (urlMap.has(trimmed)) {
      return urlMap.get(trimmed)!;
    }

    const cleanUrl = trimmed.split("?")[0];
    const urlFileName = path.basename(cleanUrl);
    if (fileMap.has(urlFileName.toLowerCase())) {
      return fileMap.get(urlFileName.toLowerCase())!;
    }

    const uploadIdx = cleanUrl.indexOf("/upload/");
    if (uploadIdx !== -1) {
      const sub = cleanUrl.substring(uploadIdx + 8);
      const parts = sub.split("/");
      if (parts[0] && parts[0].startsWith("v") && /^\d+$/.test(parts[0].substring(1))) {
        parts.shift();
      }
      const pubId = parts.join("/").split(".")[0];
      if (publicIdMap.has(pubId.toLowerCase())) {
        return publicIdMap.get(pubId.toLowerCase())!;
      }
    }

    return urlFileName || "media-asset.jpg";
  };
}

/**
 * Recursively replaces any Cloudinary URL string with its canonical VPS URL.
 */
function replaceCloudinaryInValue(value: any, resolveTarget: (url: string) => string): { value: any; changed: boolean } {
  if (value === null || value === undefined) {
    return { value, changed: false };
  }

  if (typeof value === "string") {
    if (value.includes("cloudinary.com") || value.includes("res.cloudinary.com")) {
      const targetFile = resolveTarget(value);
      const newUrl = `${VPS_BASE_URL}/${targetFile}`;
      return { value: newUrl, changed: true };
    }
    return { value, changed: false };
  }

  if (Array.isArray(value)) {
    let arrayChanged = false;
    const newArr = value.map((item) => {
      const res = replaceCloudinaryInValue(item, resolveTarget);
      if (res.changed) arrayChanged = true;
      return res.value;
    });
    return { value: arrayChanged ? newArr : value, changed: arrayChanged };
  }

  if (typeof value === "object") {
    let objChanged = false;
    const newObj: Record<string, any> = {};
    for (const [k, v] of Object.entries(value)) {
      const res = replaceCloudinaryInValue(v, resolveTarget);
      if (res.changed) objChanged = true;
      newObj[k] = res.value;
    }
    return { value: objChanged ? newObj : value, changed: objChanged };
  }

  return { value, changed: false };
}

/**
 * Helper to register clean MediaAsset and MediaReference
 */
async function registerCleanMedia(
  entityType: string,
  entityId: string,
  ref: ExtractedMediaReference,
  uploadsDir: string,
  assetMap: Map<string, string>
) {
  const url = ref.url.trim();
  let mediaId = assetMap.get(url);

  if (!mediaId) {
    const fileName = path.basename(url.split("?")[0]);
    const storagePath = `/multimedia/uploads/${fileName}`;
    const ext = path.extname(fileName).toLowerCase();
    const mimeType = MIME_MAP[ext] || (ext.includes("mp4") || ext.includes("webm") ? "video/mp4" : "image/jpeg");

    const localDiskPath = path.join(uploadsDir, fileName);
    const { hash, size } = getFileMetadata(localDiskPath);

    const asset = await withRetry(() =>
      (prisma as any).mediaAsset.upsert({
        where: { url },
        update: {
          fileName,
          storagePath,
          mimeType,
          hash: hash || undefined,
          size: size > 0 ? size : undefined,
        },
        create: {
          url,
          fileName,
          storagePath,
          mimeType,
          size: size > 0 ? size : 0,
          hash: hash || null,
          title: fileName.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " "),
          status: "ACTIVE",
        },
      })
    );

    mediaId = asset.id;
    assetMap.set(url, mediaId);
  }

  // Register Reference
  await withRetry(() =>
    (prisma as any).mediaReference.upsert({
      where: {
        mediaId_entityType_entityId_fieldPath: {
          mediaId,
          entityType,
          entityId,
          fieldPath: ref.fieldPath,
        },
      },
      update: {},
      create: {
        mediaId,
        entityType,
        entityId,
        fieldPath: ref.fieldPath,
      },
    })
  );
}

async function main() {
  console.log("===================================================================");
  console.log("🚀 MIRA Travel — Cloudinary to VPS Storage & Database URL Cutover");
  console.log("===================================================================\n");

  const uploadsDir = getUploadsDir();
  console.log(`📂 Target Local Uploads Directory: ${uploadsDir}`);

  // 1. Verify Manifest
  const manifestPath = path.resolve(process.cwd(), "../cloudinary/manifest.json");
  if (!fs.existsSync(manifestPath)) {
    throw new Error(`manifest.json not found at ${manifestPath}`);
  }
  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
  console.log(`📋 Manifest Assets Loaded: ${manifest.assets.length}`);

  const resolveTarget = buildUrlResolver(manifest.assets);

  // 2. MIGRATE ENTITY TABLES (Replace all Cloudinary URLs with VPS URLs)
  console.log("\n🔄 Phase A: Migrating Entity Records (replacing Cloudinary URLs)...");

  // A. LOCATIONS
  const locations = await withRetry(() => (prisma as any).location.findMany());
  let locUpdated = 0;
  for (const loc of locations) {
    const fieldsToUpdate: Record<string, any> = {};
    for (const [k, v] of Object.entries(loc)) {
      if (["id", "createdAt", "updatedAt"].includes(k)) continue;
      const res = replaceCloudinaryInValue(v, resolveTarget);
      if (res.changed) {
        fieldsToUpdate[k] = res.value;
      }
    }
    if (Object.keys(fieldsToUpdate).length > 0) {
      await withRetry(() =>
        (prisma as any).location.update({
          where: { id: loc.id },
          data: fieldsToUpdate,
        })
      );
      locUpdated++;
    }
  }
  console.log(`   ✔ Locations migrated: ${locUpdated} / ${locations.length}`);

  // B. JOURNEYS
  const journeys = await withRetry(() => (prisma as any).journey.findMany());
  let journeyUpdated = 0;
  for (const j of journeys) {
    const fieldsToUpdate: Record<string, any> = {};
    for (const [k, v] of Object.entries(j)) {
      if (["id", "createdAt", "updatedAt"].includes(k)) continue;
      const res = replaceCloudinaryInValue(v, resolveTarget);
      if (res.changed) {
        fieldsToUpdate[k] = res.value;
      }
    }
    if (Object.keys(fieldsToUpdate).length > 0) {
      await withRetry(() =>
        (prisma as any).journey.update({
          where: { id: j.id },
          data: fieldsToUpdate,
        })
      );
      journeyUpdated++;
    }
  }
  console.log(`   ✔ Journeys migrated: ${journeyUpdated} / ${journeys.length}`);

  // C. EXPERIENCES
  const experiences = await withRetry(() => (prisma as any).experience.findMany());
  let expUpdated = 0;
  for (const exp of experiences) {
    const fieldsToUpdate: Record<string, any> = {};
    for (const [k, v] of Object.entries(exp)) {
      if (["id", "createdAt", "updatedAt"].includes(k)) continue;
      const res = replaceCloudinaryInValue(v, resolveTarget);
      if (res.changed) {
        fieldsToUpdate[k] = res.value;
      }
    }
    if (Object.keys(fieldsToUpdate).length > 0) {
      await withRetry(() =>
        (prisma as any).experience.update({
          where: { id: exp.id },
          data: fieldsToUpdate,
        })
      );
      expUpdated++;
    }
  }
  console.log(`   ✔ Experiences migrated: ${expUpdated} / ${experiences.length}`);

  // D. STORIES
  const stories = await withRetry(() => (prisma as any).story.findMany());
  let storyUpdated = 0;
  for (const s of stories) {
    const fieldsToUpdate: Record<string, any> = {};
    for (const [k, v] of Object.entries(s)) {
      if (["id", "createdAt", "updatedAt"].includes(k)) continue;
      const res = replaceCloudinaryInValue(v, resolveTarget);
      if (res.changed) {
        fieldsToUpdate[k] = res.value;
      }
    }
    if (Object.keys(fieldsToUpdate).length > 0) {
      await withRetry(() =>
        (prisma as any).story.update({
          where: { id: s.id },
          data: fieldsToUpdate,
        })
      );
      storyUpdated++;
    }
  }
  console.log(`   ✔ Stories migrated: ${storyUpdated} / ${stories.length}`);

  // E. CMS PAGES
  const cmsPages = await withRetry(() => (prisma as any).cmsPage.findMany());
  let cmsUpdated = 0;
  for (const p of cmsPages) {
    const fieldsToUpdate: Record<string, any> = {};
    for (const [k, v] of Object.entries(p)) {
      if (["id", "createdAt", "updatedAt"].includes(k)) continue;
      const res = replaceCloudinaryInValue(v, resolveTarget);
      if (res.changed) {
        fieldsToUpdate[k] = res.value;
      }
    }
    if (Object.keys(fieldsToUpdate).length > 0) {
      await withRetry(() =>
        (prisma as any).cmsPage.update({
          where: { id: p.id },
          data: fieldsToUpdate,
        })
      );
      cmsUpdated++;
    }
  }
  console.log(`   ✔ CMS Pages migrated: ${cmsUpdated} / ${cmsPages.length}`);

  // F. SITE SETTINGS
  const settingsList = await withRetry(() => (prisma as any).siteSettings.findMany());
  let settingsUpdated = 0;
  for (const set of settingsList) {
    const fieldsToUpdate: Record<string, any> = {};
    for (const [k, v] of Object.entries(set)) {
      if (["id", "createdAt", "updatedAt"].includes(k)) continue;
      const res = replaceCloudinaryInValue(v, resolveTarget);
      if (res.changed) {
        fieldsToUpdate[k] = res.value;
      }
    }
    if (Object.keys(fieldsToUpdate).length > 0) {
      await withRetry(() =>
        (prisma as any).siteSettings.update({
          where: { id: set.id },
          data: fieldsToUpdate,
        })
      );
      settingsUpdated++;
    }
  }
  console.log(`   ✔ SiteSettings migrated: ${settingsUpdated} / ${settingsList.length}`);

  // 3. RE-SYNC MediaAsset & MediaReference WITH CLEAN VPS REGISTRY
  console.log("\n📦 Phase B: Synchronizing clean MediaAsset and MediaReference tables...");
  
  // Clear obsolete references and assets
  await withRetry(() => (prisma as any).mediaReference.deleteMany());
  await withRetry(() => (prisma as any).mediaAsset.deleteMany());

  const assetMap = new Map<string, string>(); // url -> mediaId
  let totalIndexedRefs = 0;

  // Scan updated locations
  const freshLocations = await withRetry(() => (prisma as any).location.findMany());
  for (const loc of freshLocations) {
    const refs = extractMediaReferences(loc);
    for (const ref of refs) {
      await registerCleanMedia("Location", loc.id, ref, uploadsDir, assetMap);
      totalIndexedRefs++;
    }
  }

  // Scan updated journeys
  const freshJourneys = await withRetry(() => (prisma as any).journey.findMany());
  for (const j of freshJourneys) {
    const refs = extractMediaReferences(j);
    for (const ref of refs) {
      await registerCleanMedia("Journey", j.id, ref, uploadsDir, assetMap);
      totalIndexedRefs++;
    }
  }

  // Scan updated experiences
  const freshExperiences = await withRetry(() => (prisma as any).experience.findMany());
  for (const exp of freshExperiences) {
    const refs = extractMediaReferences(exp);
    for (const ref of refs) {
      await registerCleanMedia("Experience", exp.id, ref, uploadsDir, assetMap);
      totalIndexedRefs++;
    }
  }

  // Scan updated stories
  const freshStories = await withRetry(() => (prisma as any).story.findMany());
  for (const s of freshStories) {
    const refs = extractMediaReferences(s);
    for (const ref of refs) {
      await registerCleanMedia("Story", s.id, ref, uploadsDir, assetMap);
      totalIndexedRefs++;
    }
  }

  // Scan updated CMS pages
  const freshCmsPages = await withRetry(() => (prisma as any).cmsPage.findMany());
  for (const p of freshCmsPages) {
    const refs = extractMediaReferences(p);
    for (const ref of refs) {
      await registerCleanMedia("CmsPage", p.id, ref, uploadsDir, assetMap);
      totalIndexedRefs++;
    }
  }

  // Scan updated SiteSettings
  const freshSettings = await withRetry(() => (prisma as any).siteSettings.findMany());
  for (const set of freshSettings) {
    const refs = extractMediaReferences(set);
    for (const ref of refs) {
      await registerCleanMedia("SiteSettings", set.id, ref, uploadsDir, assetMap);
      totalIndexedRefs++;
    }
  }

  console.log(`   ✔ Total Clean MediaAssets created: ${assetMap.size}`);
  console.log(`   ✔ Total Clean MediaReferences indexed: ${totalIndexedRefs}`);

  // 4. POST-MIGRATION AUDIT (Verify 0 Cloudinary links remaining)
  console.log("\n🕵️ Phase C: Running Post-Migration Verification Audit...");
  const tables = [
    { name: "Location", model: (prisma as any).location },
    { name: "Journey", model: (prisma as any).journey },
    { name: "Experience", model: (prisma as any).experience },
    { name: "Story", model: (prisma as any).story },
    { name: "CmsPage", model: (prisma as any).cmsPage },
    { name: "SiteSettings", model: (prisma as any).siteSettings },
    { name: "MediaAsset", model: (prisma as any).mediaAsset },
  ];

  let totalCloudinaryRemaining = 0;
  for (const t of tables) {
    const records = await withRetry(() => t.model.findMany());
    let matches = 0;
    for (const r of records) {
      const str = JSON.stringify(r);
      const count = (str.match(/cloudinary\.com/g) || []).length;
      if (count > 0) matches += count;
    }
    console.log(`   Table ${t.name}: ${matches} Cloudinary URLs remaining.`);
    totalCloudinaryRemaining += matches;
  }

  console.log("\n===================================================================");
  if (totalCloudinaryRemaining === 0) {
    console.log("🎉 SUCCESS: 100% of Cloudinary URLs have been migrated to VPS storage!");
    console.log("   Zero (0) Cloudinary URLs remain across the entire database.");
  } else {
    console.error(`⚠️ WARNING: ${totalCloudinaryRemaining} Cloudinary URLs still remain!`);
  }
  console.log("===================================================================\n");
}

main().catch(console.error).finally(() => prisma.$disconnect());
