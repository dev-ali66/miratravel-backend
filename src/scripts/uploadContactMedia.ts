import dotenv from "dotenv";
dotenv.config();

import { v2 as cloudinary } from "cloudinary";
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

import fs from "fs";
import path from "path";
import prisma from "../config/prisma.js";
import { uploadFilesToCloudinary } from "../shared/upload_cloudinary.service.js";

const contactMediaFiles = [
  { key: "heroVideo", fileName: "contact-us-hero.mp4", mimeType: "video/mp4" },
  { key: "inquiryImage", fileName: "contact-image.png", mimeType: "image/png" },
  { key: "planTravelImage", fileName: "plan-travel.png", mimeType: "image/png" },
];

async function uploadContactMedia() {
  console.log("Starting contact media upload to Cloudinary...");

  const imagesDir = path.resolve(process.cwd(), "..", "images");
  const uploadedUrls: Record<string, string> = {};

  for (const media of contactMediaFiles) {
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

  // Now update database record for contact-us CMS Page
  const existingPage = await prisma.cmsPage.findFirst({
    where: { slug: "contact-us" },
  });

  if (!existingPage) {
    console.error("CMS Page 'contact-us' not found in database!");
    return;
  }

  const data = (existingPage.data as any) || {};

  // Update hero video
  if (uploadedUrls["heroVideo"]) {
    data.hero = data.hero || {};
    data.hero.backgroundMultimedia = data.hero.backgroundMultimedia || {};
    data.hero.backgroundMultimedia.show = "video";
    data.hero.backgroundMultimedia.video = {
      ...data.hero.backgroundMultimedia.video,
      url: uploadedUrls["heroVideo"],
      autoplay: true,
      loop: true,
      muted: true,
      opacity: 100,
      overlayColor: "#000000",
      overlayOpacity: 0,
      fit: "cover",
    };
  }

  // Update inquiry form rightSideMultimedia
  if (uploadedUrls["inquiryImage"]) {
    data.inquiry_form = data.inquiry_form || {};
    data.inquiry_form.rightSideMultimedia = data.inquiry_form.rightSideMultimedia || {};
    data.inquiry_form.rightSideMultimedia.show = "image";
    data.inquiry_form.rightSideMultimedia.image = {
      ...data.inquiry_form.rightSideMultimedia.image,
      url: uploadedUrls["inquiryImage"],
      alt: "Plan your escape",
      opacity: 100,
      fit: "cover",
    };
  }

  // Update plan travel leftSideMultimedia
  if (uploadedUrls["planTravelImage"]) {
    data.plan_travel = data.plan_travel || {};
    data.plan_travel.leftSideMultimedia = data.plan_travel.leftSideMultimedia || {};
    data.plan_travel.leftSideMultimedia.show = "image";
    data.plan_travel.leftSideMultimedia.image = {
      ...data.plan_travel.leftSideMultimedia.image,
      url: uploadedUrls["planTravelImage"],
      alt: "A Personal Approach",
      opacity: 100,
      fit: "cover",
    };
  }

  await prisma.cmsPage.update({
    where: { id: existingPage.id },
    data: { data },
  });

  console.log("Successfully updated 'contact-us' CMS page in DB with Cloudinary URLs!");
}

uploadContactMedia()
  .catch((e) => {
    console.error("Upload script error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
