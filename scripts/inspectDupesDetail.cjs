const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function inspect() {
  const latest = await prisma.mediaAsset.findMany({
    orderBy: { createdAt: "desc" },
    take: 15,
    select: {
      id: true,
      fileName: true,
      originalName: true,
      hash: true,
      url: true,
      createdAt: true,
      status: true,
    },
  });

  console.log("=== Latest 15 MediaAsset Records ===");
  latest.forEach((r, idx) => {
    console.log(`[#${idx + 1}] ID=${r.id}`);
    console.log(`   fileName=${r.fileName}`);
    console.log(`   originalName=${r.originalName}`);
    console.log(`   hash=${r.hash?.slice(0, 16)}...`);
    console.log(`   createdAt=${r.createdAt}`);
  });

  await prisma.$disconnect();
}

inspect().catch(console.error);
