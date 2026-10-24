const fs = require("fs");
const path = require("path");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function check() {
  const assets = await prisma.mediaAsset.findMany({
    select: { id: true, fileName: true, storagePath: true, url: true, hash: true, status: true },
  });

  const uploadsDir = path.resolve(__dirname, "../multimedia/uploads");
  let missingStoragePath = 0;
  let missingInUploadsDir = 0;
  const missingSamples = [];

  for (const a of assets) {
    const directExists = a.storagePath && fs.existsSync(a.storagePath);
    const inUploadsExists = fs.existsSync(path.join(uploadsDir, a.fileName));

    if (!directExists) missingStoragePath++;
    if (!inUploadsExists) {
      missingInUploadsDir++;
      if (missingSamples.length < 5) {
        missingSamples.push(a);
      }
    }
  }

  console.log("Total MediaAssets in DB:", assets.length);
  console.log("Assets where a.storagePath does not exist directly:", missingStoragePath);
  console.log("Assets where file is missing from multimedia/uploads/:", missingInUploadsDir);
  if (missingSamples.length > 0) {
    console.log("Sample missing assets:", missingSamples);
  }

  await prisma.$disconnect();
}

check().catch(console.error);
