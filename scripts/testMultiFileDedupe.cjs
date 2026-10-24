const fs = require("fs");
const path = require("path");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

dotenv.config({ path: path.resolve(__dirname, "../.env") });

async function main() {
  console.log("=== Testing Multi-File In-Batch Deduplication ===");

  const secret = process.env.JWT_ACCESS_TOKEN_SECRET || "access_secret";
  const token = jwt.sign(
    { id: "admin-test-id", email: "admin@dev.com", role: "ADMIN" },
    secret,
    { expiresIn: "1h" }
  );

  // Sample unique image buffer
  const sampleBase64 = "iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAYAAABytg0kAAAAEklEQVR42mNk+M/wHwMDAwMDABzPA/58i7vEAAAAAElFTkSuQmCC";
  const buffer = Buffer.from(sampleBase64, "base64");

  // Send 2 identical files in the SAME multipart request
  const form = new FormData();
  form.append("image", new Blob([buffer], { type: "image/png" }), `multi-1-${Date.now()}.png`);
  form.append("image", new Blob([buffer], { type: "image/png" }), `multi-2-${Date.now()}.png`);

  const res = await fetch("http://127.0.0.1:5010/api/v1/file-upload", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  });

  const json = await res.json();
  console.log("Multi-Upload Response:", JSON.stringify(json, null, 2));

  const urls = json?.data?.image || [];
  console.log("Returned URLs count:", urls.length);
  console.log("URL 1:", urls[0]);
  console.log("URL 2:", urls[1]);
  console.log("Are both URLs identical?", urls[0] === urls[1]);
}

main().catch(console.error);
