const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

dotenv.config({ path: path.resolve(__dirname, "../.env") });

async function testExistingFileUpload() {
  const secret = process.env.JWT_ACCESS_TOKEN_SECRET || "access_secret";
  const token = jwt.sign(
    { id: "admin-test-id", email: "admin@dev.com", role: "ADMIN" },
    secret,
    { expiresIn: "1h" }
  );

  // Pick an existing file on disk that is registered in MediaAsset
  const filePath = path.resolve(__dirname, "../multimedia/uploads/greece.jpg");
  if (!fs.existsSync(filePath)) {
    console.error("File does not exist:", filePath);
    return;
  }

  const buffer = fs.readFileSync(filePath);
  const fileHash = crypto.createHash("sha256").update(buffer).digest("hex");
  console.log("Testing existing file: greece.jpg");
  console.log("Buffer size:", buffer.length);
  console.log("File SHA-256:", fileHash);

  // Check how many records in DB have this hash BEFORE upload
  const { PrismaClient } = require("@prisma/client");
  const prisma = new PrismaClient();
  const beforeRecords = await prisma.mediaAsset.findMany({ where: { hash: fileHash } });
  console.log(`MediaAsset records with this hash BEFORE upload: ${beforeRecords.length}`);
  beforeRecords.forEach((r) => console.log(` - ID: ${r.id}, fileName: ${r.fileName}, url: ${r.url}`));

  // Upload this exact file via /api/v1/file-upload
  const formData = new FormData();
  formData.append("image", new Blob([buffer], { type: "image/jpeg" }), "my-uploaded-greece.jpg");

  const res = await fetch("http://localhost:5010/api/v1/file-upload", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });

  const json = await res.json();
  console.log("\nUpload Response:", JSON.stringify(json, null, 2));

  // Check how many records in DB have this hash AFTER upload
  const afterRecords = await prisma.mediaAsset.findMany({ where: { hash: fileHash } });
  console.log(`\nMediaAsset records with this hash AFTER upload: ${afterRecords.length}`);

  const filesOnDisk = fs.readdirSync(path.resolve(__dirname, "../multimedia/uploads"));
  const matchesOnDisk = filesOnDisk.filter((f) => f.includes("my-uploaded-greece"));
  console.log("New files written to disk matching 'my-uploaded-greece':", matchesOnDisk);

  await prisma.$disconnect();
}

testExistingFileUpload().catch(console.error);
