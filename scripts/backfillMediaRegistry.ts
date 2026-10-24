/**
 * MIRA Travel — Pre-Existing Media Inventory & Backfill Engine
 * 
 * Safely discovers all media URLs across Location, Journey, Experience,
 * Story, CmsPage, and SiteSettings. Populates MediaAsset and MediaReference
 * tables without touching or mutating existing entity records.
 */

import fs from "fs";
import path from "path";
import crypto from "crypto";
import prisma from "../src/config/prisma.js";
import { extractMediaReferences, ExtractedMediaReference } from "../src/utils/mediaExtractor.js";
import { getUploadsDir } from "../src/shared/upload_local.service.js";

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
    // File not readable locally
  }
  return { hash: null, size: 0 };
}

/**
 * Derives a clean filename and storage path from any URL.
 */
function parseUrlDetails(url: string, uploadsDir: string) {
  let fileName = "";
  let storagePath = "";

  if (url.includes("/multimedia/uploads/")) {
    fileName = url.substring(url.indexOf("/multimedia/uploads/") + 20).split("?")[0];
    storagePath = `/multimedia/uploads/${fileName}`;
  } else if (url.includes("/uploads/")) {
    fileName = url.substring(url.indexOf("/uploads/") + 9).split("?")[0];
    storagePath = `/uploads/${fileName}`;
  } else {
    // Cloudinary or external URL
    const urlParts = url.split("?")[0].split("/");
    fileName = urlParts[urlParts.length - 1] || "media-asset";
    storagePath = url;
  }

  const ext = path.extname(fileName).toLowerCase();
  const mimeType = MIME_MAP[ext] || (ext.includes("mp4") || ext.includes("webm") ? "video/mp4" : "image/jpeg");

  // Attempt local file resolution
  const localDiskPath = path.join(uploadsDir, path.basename(fileName));
  const { hash, size } = getFileMetadata(localDiskPath);

  return {
    fileName,
    storagePath,
    mimeType,
    hash,
    size,
  };
}

async function main() {
  console.log("===================================================================");
  console.log("🚀 MIRA Travel — Starting Pre-Existing Media Backfill Engine");
  console.log("===================================================================\n");

  const uploadsDir = getUploadsDir();
  console.log(`📂 Local uploads directory resolved to: ${uploadsDir}\n`);

  let totalEntitiesScanned = 0;
  let totalReferencesFound = 0;
  const assetMap = new Map<string, string>(); // url -> mediaId
  const referenceStats: Record<string, number> = {
    Location: 0,
    Journey: 0,
    Experience: 0,
    Story: 0,
    CmsPage: 0,
    SiteSettings: 0,
  };

  // 1. SCAN LOCATIONS
  console.log("🔍 Scanning Locations...");
  const locations = await (prisma as any).location.findMany();
  totalEntitiesScanned += locations.length;
  for (const loc of locations) {
    const refs = extractMediaReferences(loc);
    for (const ref of refs) {
      await registerMediaAndReference("Location", loc.id, ref, uploadsDir, assetMap);
      referenceStats.Location++;
      totalReferencesFound++;
    }
  }
  console.log(`   ✔ Processed ${locations.length} Locations (${referenceStats.Location} media references).`);

  // 2. SCAN JOURNEYS
  console.log("🔍 Scanning Journeys...");
  const journeys = await (prisma as any).journey.findMany();
  totalEntitiesScanned += journeys.length;
  for (const j of journeys) {
    const refs = extractMediaReferences(j);
    for (const ref of refs) {
      await registerMediaAndReference("Journey", j.id, ref, uploadsDir, assetMap);
      referenceStats.Journey++;
      totalReferencesFound++;
    }
  }
  console.log(`   ✔ Processed ${journeys.length} Journeys (${referenceStats.Journey} media references).`);

  // 3. SCAN EXPERIENCES
  console.log("🔍 Scanning Experiences...");
  const experiences = await (prisma as any).experience.findMany();
  totalEntitiesScanned += experiences.length;
  for (const exp of experiences) {
    const refs = extractMediaReferences(exp);
    for (const ref of refs) {
      await registerMediaAndReference("Experience", exp.id, ref, uploadsDir, assetMap);
      referenceStats.Experience++;
      totalReferencesFound++;
    }
  }
  console.log(`   ✔ Processed ${experiences.length} Experiences (${referenceStats.Experience} media references).`);

  // 4. SCAN STORIES
  console.log("🔍 Scanning Editorial Stories...");
  const stories = await (prisma as any).story.findMany();
  totalEntitiesScanned += stories.length;
  for (const story of stories) {
    const refs = extractMediaReferences(story);
    for (const ref of refs) {
      await registerMediaAndReference("Story", story.id, ref, uploadsDir, assetMap);
      referenceStats.Story++;
      totalReferencesFound++;
    }
  }
  console.log(`   ✔ Processed ${stories.length} Stories (${referenceStats.Story} media references).`);

  // 5. SCAN CMS PAGES
  console.log("🔍 Scanning CMS Pages...");
  const cmsPages = await (prisma as any).cmsPage.findMany();
  totalEntitiesScanned += cmsPages.length;
  for (const page of cmsPages) {
    const refs = extractMediaReferences(page);
    for (const ref of refs) {
      await registerMediaAndReference("CmsPage", page.id, ref, uploadsDir, assetMap);
      referenceStats.CmsPage++;
      totalReferencesFound++;
    }
  }
  console.log(`   ✔ Processed ${cmsPages.length} CMS Pages (${referenceStats.CmsPage} media references).`);

  // 6. SCAN SITE SETTINGS
  console.log("🔍 Scanning Site Settings...");
  const settings = await (prisma as any).siteSettings.findMany();
  totalEntitiesScanned += settings.length;
  for (const s of settings) {
    const refs = extractMediaReferences(s);
    for (const ref of refs) {
      await registerMediaAndReference("SiteSettings", s.id, ref, uploadsDir, assetMap);
      referenceStats.SiteSettings++;
      totalReferencesFound++;
    }
  }
  console.log(`   ✔ Processed ${settings.length} Settings records (${referenceStats.SiteSettings} media references).\n`);

  // 7. SUMMARY REPORT
  const totalAssetsInDb = await (prisma as any).mediaAsset.count();
  const totalRefsInDb = await (prisma as any).mediaReference.count();

  console.log("===================================================================");
  console.log("🎉 BACKFILL COMPLETED SUCCESSFULLY!");
  console.log("===================================================================");
  console.log(`📊 Total Database Entities Scanned: ${totalEntitiesScanned}`);
  console.log(`🔗 Total Media References Discovered: ${totalReferencesFound}`);
  console.log(`🖼️ Total Unique Media Assets Registered: ${totalAssetsInDb}`);
  console.log(`📋 Total Verified Media References in DB: ${totalRefsInDb}`);
  console.log("Breakdown by Model:", referenceStats);
  console.log("===================================================================\n");
}

async function registerMediaAndReference(
  entityType: string,
  entityId: string,
  ref: ExtractedMediaReference,
  uploadsDir: string,
  assetMap: Map<string, string>,
) {
  const url = ref.url;
  let mediaId = assetMap.get(url);

  if (!mediaId) {
    const { fileName, storagePath, mimeType, hash, size } = parseUrlDetails(url, uploadsDir);

    const asset = await (prisma as any).mediaAsset.upsert({
      where: { url },
      update: {
        updatedAt: new Date(),
      },
      create: {
        fileName,
        originalName: fileName,
        storagePath,
        url,
        mimeType,
        size,
        hash,
        status: "ACTIVE",
      },
    });

    mediaId = asset.id;
    assetMap.set(url, mediaId);
  }

  // Upsert the specific reference link
  await (prisma as any).mediaReference.upsert({
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
  });
}

main()
  .catch((err) => {
    console.error("❌ Backfill failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
