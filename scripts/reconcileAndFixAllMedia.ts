import "dotenv/config";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const uploadsDir = path.resolve(process.cwd(), "multimedia/uploads");
const VPS_BASE_URL = "https://api.miratravel.nl/multimedia/uploads";

// 1. JOURNEY MASTER IMAGE MAPPINGS (from seedAllFrontendJourneys.ts)
const JOURNEY_IMAGE_MAP: Record<string, string> = {
  "the-great-ionian-seaboard": "albania-journey7.jpg",
  "gorge-ferries-drin-river-canyons": "albania-journey2.png",
  "spiritual-laos": "Image (Laos temples).png",
  "island-hopping": "Image (Island Hopping).png",
  "wildlife-discovery": "Image (Wildlife Discovery).png",
  "balkans-discovery": "Image (Balkans).png",
  "ancient-albania-beyond": "Image (Albania).png",
  "capital-pulse-northern-gateway": "albania-journey3.png",
  "montenegro-highlights": "Image (Montenegro).png",
  "southeastern-highlands-byzantine-frescoes": "albania-journey4.jpg",
  "adriatic-cross-border-odyssey": "Image (Croatia).png",
  "the-classical-ottoman-crossroads": "albania-journey5.jpg",
  "ancient-rome-beyond": "Image (Ancient Rome Journey).png",
  "yellowstone-wilderness": "Image (Yellowstone Wilderness).png",
  "temple-trail": "Image (Temple Trail).png",
  "escape-of-the-cruiser": "Image (Greek Heritage).png",
  "island-escape": "Greek-Heritage-wishlist-1.png",
  "classic-albania": "albania-journey1.jpg",
  "ancient-temples": "albania-journey8.jpg",
  "thermal-waters-stone-bridges": "albania-journey6.jpg",
  "northern-lights-expedition": "Image (Northern Lights).png",
  "australian-paradise": "Image (Whitsundays).png",
  "ultimate-wildlife-expedition": "Image (Wildlife Discovery) (1).png",
};

// 2. LOCATION / LANDMARK IMAGE MAPPINGS
const LOCATION_IMAGE_MAP: Record<string, string> = {
  // Landmarks
  "lock-in-tower": "therch.jpg",
  "berat-castle": "berat.jpg",
  "stari-most": "mostar-culture.jpg",
  "dubrovnik-city-walls": "croatia.jpg",
  "rozafa-castle": "albania.png",
  "onufri-museum": "featured-berat.jpg",
  "gjirokaster-fortress": "gjirokaster.jpg",
  "san-giovanni-fortress": "kotor-bay.jpg",
  "bled-castle": "balkan1.jpg",
  "bunkart-tirana": "tirana.jpg",
  // Regions & Countries
  "albania": "albania.png",
  "north-albania": "north.jpg",
  "central-albania": "berat.jpg",
  "southern-albania": "southern-albania.png",
  "eastern-albania": "eastern-albania.png",
  "albanian-riviera": "road-riveria.jpg",
  "tirana": "tirana.jpg",
  "berat": "berat.jpg",
  "gjirokaster": "gjirokaster.jpg",
  "kotor": "kotor-bay.jpg",
  "theth": "therch.jpg",
  "bosnia": "bosnia.jpg",
  "eastern-bosnia": "bosnia.jpg",
  "central-bosnia": "mostar-culture.jpg",
  "croatia": "croatia.jpg",
  "montenegro": "monte.jpg",
  "greece": "greece.jpg",
  "kosovo": "kosvo.jpg",
  "bulgaria": "bulgaria.jpg",
  "europe": "overview-hero.png",
};

// 3. CMS PAGES IMAGE MAPPINGS
const CMS_IMAGE_MAP: Record<string, string> = {
  "about-us": "about-hero.png",
  "contact-us": "contact-image.png",
  "home": "home-image.png",
  "stories": "stories.png",
  "footer": "footer-logo.png",
};

function ensureFileExistsOnDisk(fileName: string, fallbackMaster: string) {
  const targetPath = path.join(uploadsDir, fileName);
  if (!fs.existsSync(targetPath)) {
    const masterPath = path.join(uploadsDir, fallbackMaster);
    if (fs.existsSync(masterPath)) {
      fs.copyFileSync(masterPath, targetPath);
      console.log(`   [DISK SYNC] Created ${fileName} <= (copy of master ${fallbackMaster})`);
    } else {
      // Fallback to default
      const defaultPath = path.join(uploadsDir, "overview-hero.png");
      if (fs.existsSync(defaultPath)) {
        fs.copyFileSync(defaultPath, targetPath);
        console.log(`   [DISK SYNC] Created ${fileName} <= (copy of default overview-hero.png)`);
      }
    }
  }
}

async function main() {
  console.log("==========================================================");
  console.log("🚀 MIRA Travel — Comprehensive 404 Media Reconciliation Engine");
  console.log("==========================================================\n");

  // Step 1: Identify all truly missing assets
  const allMediaAssets = await prisma.mediaAsset.findMany({
    include: { references: true },
  });

  const missingAssets = allMediaAssets.filter(
    (a) => !fs.existsSync(path.join(uploadsDir, a.fileName))
  );

  console.log(`📊 Total MediaAsset records: ${allMediaAssets.length}`);
  console.log(`❌ Currently missing from local uploads: ${missingAssets.length}\n`);

  // Step 2: Map each missing asset to its authentic master file
  const missingFileToMaster = new Map<string, string>();

  // Fetch all entities referenced
  const journeyIds = new Set<string>();
  const locationIds = new Set<string>();
  const cmsPageIds = new Set<string>();

  for (const m of missingAssets) {
    for (const r of m.references) {
      if (r.entityType === "Journey") journeyIds.add(r.entityId);
      if (r.entityType === "Location") locationIds.add(r.entityId);
      if (r.entityType === "CmsPage") cmsPageIds.add(r.entityId);
    }
  }

  const journeys = await prisma.journey.findMany({
    where: { id: { in: Array.from(journeyIds) } },
  });
  const locations = await prisma.location.findMany({
    where: { id: { in: Array.from(locationIds) } },
  });
  const cmsPages = await prisma.cmsPage.findMany({
    where: { id: { in: Array.from(cmsPageIds) } },
  });

  const journeyMap = new Map(journeys.map((j) => [j.id, j]));
  const locationMap = new Map(locations.map((l) => [l.id, l]));
  const cmsPageMap = new Map(cmsPages.map((p) => [p.id, p]));

  for (const m of missingAssets) {
    let resolvedMaster = "overview-hero.png"; // universal fallback

    for (const r of m.references) {
      if (r.entityType === "Journey") {
        const j = journeyMap.get(r.entityId);
        if (j && JOURNEY_IMAGE_MAP[j.slug]) {
          resolvedMaster = JOURNEY_IMAGE_MAP[j.slug];
          break;
        }
      } else if (r.entityType === "Location") {
        const l = locationMap.get(r.entityId);
        if (l) {
          if (LOCATION_IMAGE_MAP[l.slug]) {
            resolvedMaster = LOCATION_IMAGE_MAP[l.slug];
            break;
          }
          // Country match
          const slugParts = l.slug.split("-");
          for (const sp of slugParts) {
            if (LOCATION_IMAGE_MAP[sp]) {
              resolvedMaster = LOCATION_IMAGE_MAP[sp];
              break;
            }
          }
        }
      } else if (r.entityType === "CmsPage") {
        const p = cmsPageMap.get(r.entityId);
        if (p && CMS_IMAGE_MAP[p.slug]) {
          resolvedMaster = CMS_IMAGE_MAP[p.slug];
          break;
        }
      }
    }

    missingFileToMaster.set(m.fileName, resolvedMaster);
  }

  console.log("🔗 Step 2: Ensuring physical files exist on disk for all missing filenames...");
  let syncedOnDisk = 0;
  for (const [missingName, masterFile] of missingFileToMaster.entries()) {
    ensureFileExistsOnDisk(missingName, masterFile);
    syncedOnDisk++;
  }
  console.log(`✓ Synchronized ${syncedOnDisk} files onto disk in multimedia/uploads/\n`);

  // Step 3: Update database entities so they point to the authentic clean master filename
  console.log("📝 Step 3: Updating entity records in Database to canonical master URLs...");

  // Update Journeys
  for (const j of journeys) {
    const master = JOURNEY_IMAGE_MAP[j.slug];
    if (!master) continue;

    let updated = false;
    const hero: any = j.hero || {};
    if (hero.backgroundMultimedia?.image?.url?.includes("/multimedia/uploads/")) {
      const cur = path.basename(hero.backgroundMultimedia.image.url);
      if (missingFileToMaster.has(cur)) {
        hero.backgroundMultimedia.image.url = `${VPS_BASE_URL}/${master}`;
        updated = true;
      }
    }

    const whatsIncluded: any = j.whatsIncluded || {};
    if (whatsIncluded.backgroundMultimedia?.image?.url?.includes("/multimedia/uploads/")) {
      const cur = path.basename(whatsIncluded.backgroundMultimedia.image.url);
      if (missingFileToMaster.has(cur)) {
        whatsIncluded.backgroundMultimedia.image.url = `${VPS_BASE_URL}/${master}`;
        updated = true;
      }
    }

    const metadata: any = j.metadata || {};
    if (metadata.seo?.ogImage?.includes("/multimedia/uploads/")) {
      const cur = path.basename(metadata.seo.ogImage);
      if (missingFileToMaster.has(cur)) {
        metadata.seo.ogImage = `${VPS_BASE_URL}/${master}`;
        updated = true;
      }
    }

    if (updated) {
      await prisma.journey.update({
        where: { id: j.id },
        data: { hero, whatsIncluded, metadata },
      });
      console.log(`   ✓ Updated Journey '${j.title}' -> ${master}`);
    }
  }

  // Update Locations
  for (const l of locations) {
    const master = LOCATION_IMAGE_MAP[l.slug] || "overview-hero.png";
    let updated = false;

    const hero: any = l.hero || {};
    if (hero.backgroundMultimedia?.image?.url?.includes("/multimedia/uploads/")) {
      const cur = path.basename(hero.backgroundMultimedia.image.url);
      if (missingFileToMaster.has(cur)) {
        hero.backgroundMultimedia.image.url = `${VPS_BASE_URL}/${master}`;
        updated = true;
      }
    }

    const essence: any = l.essence || {};
    if (essence.imageMultimedia?.image?.url?.includes("/multimedia/uploads/")) {
      const cur = path.basename(essence.imageMultimedia.image.url);
      if (missingFileToMaster.has(cur)) {
        essence.imageMultimedia.image.url = `${VPS_BASE_URL}/${master}`;
        updated = true;
      }
    }

    if (updated) {
      await prisma.location.update({
        where: { id: l.id },
        data: { hero, essence },
      });
      console.log(`   ✓ Updated Location '${l.name}' -> ${master}`);
    }
  }

  // Step 4: Refresh MediaAsset table with size, hash, and status
  console.log("\n🔄 Step 4: Refreshing MediaAsset records in DB...");
  const allAssetsNow = await prisma.mediaAsset.findMany();
  let updatedAssets = 0;

  for (const a of allAssetsNow) {
    const localPath = path.join(uploadsDir, a.fileName);
    if (fs.existsSync(localPath)) {
      const buf = fs.readFileSync(localPath);
      const hash = crypto.createHash("sha256").update(buf).digest("hex");
      const size = buf.length;

      if (a.size !== size || a.hash !== hash) {
        await prisma.mediaAsset.update({
          where: { id: a.id },
          data: { size, hash, status: "ACTIVE" },
        });
        updatedAssets++;
      }
    }
  }
  console.log(`✓ Updated metadata (size/hash) for ${updatedAssets} MediaAsset records.`);

  // Step 5: Verification
  const verifyMissing = allAssetsNow.filter(
    (a) => !fs.existsSync(path.join(uploadsDir, a.fileName))
  );
  console.log("\n==========================================================");
  console.log(`🎉 LOCAL RECONCILIATION RESULT:`);
  console.log(`   - Total Assets: ${allAssetsNow.length}`);
  console.log(`   - Present on Disk (Local): ${allAssetsNow.length - verifyMissing.length}`);
  console.log(`   - Missing from Disk: ${verifyMissing.length}`);
  console.log("==========================================================\n");

  await prisma.$disconnect();
}

main().catch(console.error);
