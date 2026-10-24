import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

async function main() {
  const uploadsDir = path.resolve(process.cwd(), "multimedia/uploads");
  const assets = await prisma.mediaAsset.findMany({
    include: {
      references: {
        select: { entityType: true, entityId: true, fieldPath: true },
      },
    },
  });

  const missing: any[] = [];
  const present: any[] = [];

  for (const a of assets) {
    const fullPath = path.join(uploadsDir, a.fileName);
    if (fs.existsSync(fullPath)) {
      present.push(a);
    } else {
      missing.push({
        fileName: a.fileName,
        url: a.url,
        referencesCount: a.references.length,
        references: a.references,
      });
    }
  }

  console.log("==========================================");
  console.log(`Total MediaAsset in DB: ${assets.length}`);
  console.log(`Present on Disk (200 OK): ${present.length}`);
  console.log(`Missing on Disk (404):    ${missing.length}`);
  console.log("==========================================");

  // Group missing by entityType
  const entityStats: Record<string, number> = {};
  for (const m of missing) {
    for (const r of m.references) {
      entityStats[r.entityType] = (entityStats[r.entityType] || 0) + 1;
    }
  }
  console.log("\nMissing references broken down by Entity:");
  console.log(entityStats);

  console.log("\nFirst 10 missing files:");
  for (let i = 0; i < Math.min(10, missing.length); i++) {
    console.log(`- ${missing[i].fileName} (refs: ${missing[i].referencesCount}) -> ${missing[i].url}`);
  }

  await prisma.$disconnect();
}

main().catch(console.error);
