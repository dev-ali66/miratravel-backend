const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function inspectAllDupes() {
  const dupes = await prisma.$queryRaw`
    SELECT hash, COUNT(*) as count 
    FROM "MediaAsset" 
    WHERE hash IS NOT NULL 
    GROUP BY hash 
    HAVING COUNT(*) > 1
    ORDER BY count DESC;
  `;

  console.log(`Found ${dupes.length} hashes with duplicates.`);
  for (const d of dupes) {
    const records = await prisma.mediaAsset.findMany({
      where: { hash: d.hash },
      select: { id: true, fileName: true, originalName: true, createdAt: true, url: true },
    });
    console.log(`\nHash: ${d.hash.slice(0, 16)}... (Count: ${d.count})`);
    records.slice(0, 4).forEach((r) => {
      console.log(`  - ${r.fileName} (originalName: ${r.originalName}, created: ${r.createdAt.toISOString()})`);
    });
  }

  await prisma.$disconnect();
}

inspectAllDupes().catch(console.error);
