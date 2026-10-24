const fs = require("fs");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.resolve(__dirname, "../.env") });

async function main() {
  console.log("=== Testing File Upload and Hash Deduplication ===");

  const secret = process.env.JWT_ACCESS_TOKEN_SECRET || "access_secret";
  // Generate a valid mock or admin token
  const token = jwt.sign(
    {
      id: "admin-test-id",
      email: "admin@dev.com",
      role: "ADMIN",
    },
    secret,
    { expiresIn: "1h" }
  );

  console.log("Using Token:", token.slice(0, 20) + "...");

  // Sample 2x2 PNG base64
  const sampleBase64 = "iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAYAAABytg0kAAAAEklEQVR42mNk+M/wHwMDAwMDABzPA/58i7vEAAAAAElFTkSuQmCC";
  const buffer = Buffer.from(sampleBase64, "base64");
  const filename = `hash-test-${Date.now()}.png`;

  console.log(`Buffer size: ${buffer.length} bytes`);
  const computedHash = crypto.createHash("sha256").update(buffer).digest("hex");
  console.log("Computed SHA-256:", computedHash);

  // 1. Upload to /api/v1/file-upload
  const form1 = new FormData();
  form1.append("image", new Blob([buffer], { type: "image/png" }), filename);

  const res1 = await fetch("http://127.0.0.1:5010/api/v1/file-upload", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: form1,
  });

  const json1 = await res1.json();
  console.log("\n--- Upload 1 Result ---");
  console.log(JSON.stringify(json1, null, 2));
  const url1 = json1?.data?.image?.[0];

  // 2. Upload identical buffer to /api/v1/file-upload
  const form2 = new FormData();
  form2.append("image", new Blob([buffer], { type: "image/png" }), `second-${filename}`);

  const res2 = await fetch("http://127.0.0.1:5010/api/v1/file-upload", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
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

  // 3. Also test /api/v1/media/upload
  console.log("\n--- Testing /api/v1/media/upload ---");
  const mediaForm1 = new FormData();
  mediaForm1.append("files", new Blob([buffer], { type: "image/png" }), `media-${filename}`);

  const mRes1 = await fetch("http://127.0.0.1:5010/api/v1/media/upload", {
    method: "POST",
    body: mediaForm1,
  });
  const mJson1 = await mRes1.json();
  console.log("Media Upload 1:", JSON.stringify(mJson1, null, 2));

  const mediaForm2 = new FormData();
  mediaForm2.append("files", new Blob([buffer], { type: "image/png" }), `media-2-${filename}`);

  const mRes2 = await fetch("http://127.0.0.1:5010/api/v1/media/upload", {
    method: "POST",
    body: mediaForm2,
  });
  const mJson2 = await mRes2.json();
  console.log("Media Upload 2:", JSON.stringify(mJson2, null, 2));
}

main().catch(console.error);
