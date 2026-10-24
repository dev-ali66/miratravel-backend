const { PrismaClient } = require("@prisma/client");
const path = require("path");
const prisma = new PrismaClient();
const { extractMediaReferences } = require("../dist/src/utils/mediaExtractor.js");

async function run() {
  const mockStory = {
    id: "test_story_debug_1",
    title: "Test Editorial Story",
    hero: {
      imageMultimedia: {
        image: { url: "https://api.miratravel.nl/multimedia/uploads/test-isolated-1792814224525.jpg" },
      },
    },
  };

  const extracted = extractMediaReferences(mockStory);
  console.log("1. Extracted:", extracted);

  for (const item of extracted) {
    const rawUrl = item.url;
    const baseName = path.basename(rawUrl.split("?")[0]);
    console.log("2. rawUrl:", rawUrl, "baseName:", baseName);

    const asset = await prisma.mediaAsset.findFirst({
      where: {
        OR: [{ url: rawUrl }, { fileName: baseName }],
      },
      select: { id: true, status: true },
    });
    console.log("3. Asset found:", asset);
  }

  await prisma.$disconnect();
}
run();
