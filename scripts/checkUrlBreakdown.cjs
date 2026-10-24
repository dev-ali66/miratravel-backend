const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function check() {
  const cloudinaryCount = await prisma.mediaAsset.count({ where: { url: { contains: "cloudinary" } } });
  const localCount = await prisma.mediaAsset.count({ where: { url: { contains: "multimedia/uploads" } } });
  const relativeCount = await prisma.mediaAsset.count({ where: { url: { startsWith: "/" } } });
  const total = await prisma.mediaAsset.count();

  console.log("MediaAsset URL breakdown:");
  console.log(" - Total:", total);
  console.log(" - Cloudinary:", cloudinaryCount);
  console.log(" - Local multimedia/uploads:", localCount);
  console.log(" - Relative (/images/...):", relativeCount);

  // Sample relative URLs
  const sampleRelative = await prisma.mediaAsset.findMany({
    where: { url: { startsWith: "/" } },
    take: 5,
    select: { id: true, fileName: true, url: true, storagePath: true },
  });
  console.log("\nSample relative URL assets:", sampleRelative);

  await prisma.$disconnect();
}

check().catch(console.error);
