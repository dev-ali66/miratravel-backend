import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

async function main() {
  console.log("=== Comprehensive Disk & Database Audit of all MediaAssets ===\n");

  const uploadsDir = path.resolve(process.cwd(), "multimedia/uploads");
  const assets = await prisma.mediaAsset.findMany({
    include: {
      references: {
        select: { entityType: true, entityId: true, fieldPath: true },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  console.log(`Total MediaAsset records in Database: ${assets.length}\n`);

  const presentOnDisk: any[] = [];
  const missingFromDisk: any[] = [];

  for (const asset of assets) {
    const filePath = path.join(uploadsDir, asset.fileName);
    const exists = fs.existsSync(filePath);

    if (exists) {
      const stats = fs.statSync(filePath);
      presentOnDisk.push({
        fileName: asset.fileName,
        size: stats.size,
        refCount: asset.references.length,
      });
    } else {
      missingFromDisk.push({
        id: asset.id,
        fileName: asset.fileName,
        url: asset.url,
        status: asset.status,
        refCount: asset.references.length,
        references: asset.references,
      });
    }
  }

  console.log(`✅ Present on disk (200 OK):  ${presentOnDisk.length}`);
  console.log(`❌ Missing from disk (404):    ${missingFromDisk.length}\n`);

  if (missingFromDisk.length > 0) {
    console.log("=== Detailed List of Missing 404 Assets ===");
    for (const m of missingFromDisk) {
      console.log(`\n• File: ${m.fileName}`);
      console.log(`  URL:  ${m.url}`);
      console.log(`  Total References: ${m.refCount}`);
      for (const r of m.references) {
        console.log(`    - [${r.entityType}] ID: ${r.entityId} (${r.fieldPath})`);
      }
    }
  }

  await prisma.$disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
