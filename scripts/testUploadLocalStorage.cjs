const fs = require("fs");
const path = require("path");

async function testUploadFilesToLocalStorage() {
  const { uploadFilesToLocalStorage } = await import("../dist/src/shared/upload_local.service.js");
  const { PrismaClient } = await import("@prisma/client");
  const prisma = new PrismaClient();

  // Test buffer
  const sampleBase64 = "iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAYAAABytg0kAAAAEklEQVR42mNk+M/wHwMDAwMDABzPA/58i7vEAAAAAElFTkSuQmCC";
  const buffer = Buffer.from(sampleBase64, "base64");

  console.log("=== Call 1 to uploadFilesToLocalStorage ===");
  const res1 = await uploadFilesToLocalStorage(buffer, "image/png", "testField", "test-image.png");
  console.log("Result 1:", res1);

  console.log("\n=== Call 2 to uploadFilesToLocalStorage (Same Buffer, Different Name) ===");
  const res2 = await uploadFilesToLocalStorage(buffer, "image/png", "testField", "test-image-2.png");
  console.log("Result 2:", res2);

  console.log("\nAre URLs identical?", res1.url === res2.url);
  console.log("Are fileNames identical?", res1.fileName === res2.fileName);

  await prisma.$disconnect();
}

testUploadFilesToLocalStorage().catch(console.error);
