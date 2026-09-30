import config from "../config/index.js";
import { v2 as cloudinary } from "cloudinary";
cloudinary.config({
  cloud_name: config.CLOUDINARY_CLOUD_NAME,
  api_key: config.CLOUDINARY_API_KEY,
  api_secret: config.CLOUDINARY_API_SECRET,
});

import fs from "fs";
import path from "path";
import prisma from "../config/prisma.js";
import { uploadFilesToCloudinary } from "../shared/upload_cloudinary.service.js";

const landmarkImageMapping: Record<string, string> = {
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
};

async function uploadAndUpdateLandmarks() {
  console.log("Starting image upload for landmarks via Cloudinary service...");

  const imagesDir = path.resolve(process.cwd(), "..", "images");
  const uploadedUrls: Record<string, string> = {};

  for (const [slug, fileName] of Object.entries(landmarkImageMapping)) {
    const filePath = path.join(imagesDir, fileName);

    if (!fs.existsSync(filePath)) {
      console.warn(`File not found: ${filePath}, skipping...`);
      continue;
    }

    console.log(`Uploading ${fileName} for landmark '${slug}'...`);
    const fileBuffer = fs.readFileSync(filePath);
    const ext = path.extname(fileName).toLowerCase().replace(".", "");
    const mimeType = ext === "png" ? "image/png" : "image/jpeg";

    try {
      const uploadResult = await uploadFilesToCloudinary(
        fileBuffer,
        mimeType,
        "landmarkImage",
        {},
        "P"
      );

      const cloudinaryUrl = uploadResult?.secure_url || uploadResult?.url;
      console.log(`Uploaded '${slug}' successfully: ${cloudinaryUrl}`);
      uploadedUrls[slug] = cloudinaryUrl;

      const existingLandmark = await prisma.location.findFirst({
        where: { slug },
      });

      if (existingLandmark) {
        const currentHero = (existingLandmark.hero as any) || {};
        const updatedHero = {
          ...currentHero,
          backgroundMultimedia: {
            show: "image",
            color: { color: "#171717", opacity: 100 },
            image: {
              url: cloudinaryUrl,
              alt: existingLandmark.name,
              opacity: 100,
              overlayColor: "#000000",
              overlayOpacity: 40,
              fit: "cover",
            },
          },
        };

        await prisma.location.update({
          where: { id: existingLandmark.id },
          data: {
            hero: updatedHero,
          },
        });
        console.log(`Updated DB location record '${slug}' with Cloudinary URL.`);
      } else {
        console.warn(`Landmark '${slug}' not found in DB.`);
      }
    } catch (err) {
      console.error(`Error uploading '${fileName}':`, err);
    }
  }

  console.log("Uploaded Cloudinary URLs map:", JSON.stringify(uploadedUrls, null, 2));
  console.log("Landmark image upload & DB update completed!");
}

uploadAndUpdateLandmarks()
  .catch((e) => {
    console.error("Upload script failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
