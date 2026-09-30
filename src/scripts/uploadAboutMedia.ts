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

const aboutMediaFiles = [
  { key: "heroImage", fileName: "about-hero.png", mimeType: "image/png" },
  { key: "philosophyImage1", fileName: "about-albania-journey2.png", mimeType: "image/png" },
  { key: "philosophyImage2", fileName: "about-balkan1.jpg", mimeType: "image/jpeg" },
  { key: "philosophyImage3", fileName: "about-balkan2.jpg", mimeType: "image/jpeg" },
  { key: "approachLeftImage", fileName: "about-why-mira.jpg", mimeType: "image/jpeg" },
  { key: "approachRightVideo", fileName: "about-overview-hero.mp4", mimeType: "video/mp4" },
  { key: "regionalImage1", fileName: "kotor-bay.jpg", mimeType: "image/jpeg" },
  { key: "regionalImage2", fileName: "berat.jpg", mimeType: "image/jpeg" },
];

async function uploadAboutMedia() {
  console.log("Starting About page media upload to Cloudinary...");

  const imagesDir = path.resolve(process.cwd(), "..", "images");
  const uploadedUrls: Record<string, string> = {};

  for (const media of aboutMediaFiles) {
    const filePath = path.join(imagesDir, media.fileName);

    if (!fs.existsSync(filePath)) {
      console.warn(`File not found: ${filePath}, skipping...`);
      continue;
    }

    console.log(`Uploading '${media.fileName}' via Cloudinary service...`);
    const fileBuffer = fs.readFileSync(filePath);

    try {
      const uploadResult = await uploadFilesToCloudinary(
        fileBuffer,
        media.mimeType,
        media.key,
        {},
        "P"
      );

      const cloudinaryUrl = uploadResult?.secure_url || uploadResult?.url;
      console.log(`Uploaded '${media.key}' successfully -> ${cloudinaryUrl}`);
      uploadedUrls[media.key] = cloudinaryUrl;
    } catch (err) {
      console.error(`Error uploading '${media.fileName}':`, err);
    }
  }

  console.log("\nUploaded Cloudinary URLs map:\n", JSON.stringify(uploadedUrls, null, 2));
}

uploadAboutMedia()
  .catch((e) => {
    console.error("Upload script error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
