import dotenv from "dotenv";
import path from "path";
import prisma from "../src/config/prisma.js";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

async function run() {
  console.log("=== Testing File Upload and Hash Deduplication ===");

  const sampleBase64 = "iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAYAAABytg0kAAAAEklEQVR42mNk+M/wHwMDAwMDABzPA/58i7vEAAAAAElFTkSuQmCC";
  const buffer = Buffer.from(sampleBase64, "base64");
  const filename = `hash-test-${Date.now()}.png`;

  console.log(`Buffer size: ${buffer.length} bytes`);

  // First upload via /api/v1/file-upload
  const form1 = new FormData();
  form1.append("image", new Blob([buffer], { type: "image/png" }), filename);

  const res1 = await fetch("http://localhost:5010/api/v1/file-upload", {
    method: "POST",
    body: form1,
  });

  const json1 = await res1.json();
  console.log("\n--- Upload 1 Result ---");
  console.log(JSON.stringify(json1, null, 2));

  const url1 = json1?.data?.image?.[0];

  // Second upload with the exact same content, different or same filename
  const form2 = new FormData();
  form2.append("image", new Blob([buffer], { type: "image/png" }), `second-${filename}`);

  const res2 = await fetch("http://localhost:5010/api/v1/file-upload", {
    method: "POST",
    body: form2,
  });

  const json2 = await res2.json();
  console.log("\n--- Upload 2 Result ---");
  console.log(JSON.stringify(json2, null, 2));

  const url2 = json2?.data?.image?.[0];

  console.log("\n--- Comparison ---");
  console.log("URL 1:", url1);
  console.log("URL 2:", url2);
  console.log("Are URLs identical?", url1 === url2);

  // Check database records
  const crypto = await import("crypto");
  const hash = crypto.createHash("sha256").update(buffer).digest("hex");
  console.log("\nComputed SHA-256:", hash);

  const assets = await prisma.mediaAsset.findMany({
    where: { hash },
  });

  console.log(`Matching records in MediaAsset for hash ${hash}: ${assets.length}`);
  for (const a of assets) {
    console.log(` - ID: ${a.id}, fileName: ${a.fileName}, url: ${a.url}, status: ${a.status}, deletedAt: ${a.deletedAt}`);
  }

  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
