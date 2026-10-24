import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

async function main() {
  const manifestPath = path.resolve(process.cwd(), "../cloudinary/manifest.json");
  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));

  // Build mapping from removedFile -> keptFile
  const dedupeMap = new Map<string, string>();
  if (manifest.deduplication && Array.isArray(manifest.deduplication.duplicates)) {
    for (const d of manifest.deduplication.duplicates) {
      if (d.removedFile && d.keptFile) {
        dedupeMap.set(d.removedFile.toLowerCase(), d.keptFile);
      }
    }
  }

  // Also map assets canonical_file
  const assetCanonicalMap = new Map<string, string>();
  for (const a of manifest.assets || []) {
    const pubBase = path.basename(a.public_id || "").toLowerCase();
    const secBase = path.basename((a.secure_url || "").split("?")[0]).toLowerCase();
    const can = a.canonical_file || (a.local_file_path ? path.basename(a.local_file_path) : null);
    if (can) {
      if (pubBase) assetCanonicalMap.set(pubBase, can);
      if (secBase) assetCanonicalMap.set(secBase, can);
      // without extension
      const noExt = secBase.replace(/\.[^/.]+$/, "");
      assetCanonicalMap.set(noExt, can);
    }
  }

  const uploadsDir = path.resolve(process.cwd(), "multimedia/uploads");
  const assets = await prisma.mediaAsset.findMany();

  const missingAssets: any[] = [];
  let mappableToKeptFile = 0;
  let unmappedMissing = 0;

  const mappingExamples: any[] = [];
  const unmappedExamples: string[] = [];

  for (const a of assets) {
    const exists = fs.existsSync(path.join(uploadsDir, a.fileName));
    if (!exists) {
      missingAssets.push(a);
      const fnLower = a.fileName.toLowerCase();
      const fnNoExt = fnLower.replace(/\.[^/.]+$/, "");

      const keptFile = dedupeMap.get(fnLower) || assetCanonicalMap.get(fnLower) || assetCanonicalMap.get(fnNoExt);

      if (keptFile && fs.existsSync(path.join(uploadsDir, keptFile))) {
        mappableToKeptFile++;
        if (mappingExamples.length < 5) {
          mappingExamples.push({ missing: a.fileName, mapsToKept: keptFile });
        }
      } else {
        unmappedMissing++;
        if (unmappedExamples.length < 10) {
          unmappedExamples.push(a.fileName);
        }
      }
    }
  }

  console.log("=== MISSING ASSET ANALYSIS ===");
  console.log(`Total Missing Assets: ${missingAssets.length}`);
  console.log(`Can be resolved by Deduplication Map (keptFile on disk): ${mappableToKeptFile}`);
  console.log(`Unmapped / Completely Missing: ${unmappedMissing}`);

  console.log("\nSample Deduplication Mappings (Alias -> Real Kept File):");
  console.log(mappingExamples);

  console.log("\nSample Unmapped Files:");
  console.log(unmappedExamples);

  await prisma.$disconnect();
}

main().catch(console.error);
