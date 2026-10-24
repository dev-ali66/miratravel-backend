const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function check() {
  const dupes = await prisma.$queryRaw`
    SELECT hash, COUNT(*) as count 
    FROM "MediaAsset" 
    WHERE hash IS NOT NULL 
    GROUP BY hash 
    HAVING COUNT(*) > 1
    ORDER BY count DESC
    LIMIT 20;
  `;
  console.log("Duplicate hashes in DB:", dupes);
  const total = await prisma.mediaAsset.count();
  console.log("Total MediaAssets in DB:", total);
  const nullHash = await prisma.mediaAsset.count({ where: { hash: null } });
  console.log("MediaAssets with NULL hash:", nullHash);

  // Also check if any fileName appears multiple times
  const dupeNames = await prisma.$queryRaw`
    SELECT "fileName", COUNT(*) as count
    FROM "MediaAsset"
    GROUP BY "fileName"
    HAVING COUNT(*) > 1
    ORDER BY count DESC
    LIMIT 20;
  `;
  console.log("Duplicate fileNames in DB:", dupeNames);

  await prisma.$disconnect();
}

check().catch(console.error);
