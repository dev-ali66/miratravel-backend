const jwt = require("jsonwebtoken");
const path = require("path");
const dotenv = require("dotenv");

dotenv.config({ path: path.resolve(__dirname, "../.env") });

async function testCheckHash() {
  const secret = process.env.JWT_ACCESS_TOKEN_SECRET || "access_secret";
  const token = jwt.sign(
    { id: "admin-test-id", email: "admin@dev.com", role: "ADMIN" },
    secret,
    { expiresIn: "1h" }
  );

  // Existing hash from previous test: 4916738262e14932b1d698cc1882ee2517a2d2c43ab721efa61fe9ce74072cc7
  const existingHash = "4916738262e14932b1d698cc1882ee2517a2d2c43ab721efa61fe9ce74072cc7";
  const fakeHash = "0000000000000000000000000000000000000000000000000000000000000000";

  console.log("=== 1. Testing check-hash on /api/v1/media (Existing Hash) ===");
  const res1 = await fetch(`http://127.0.0.1:5010/api/v1/media/check-hash/${existingHash}`);
  console.log("Status:", res1.status);
  console.log("Response:", await res1.json());

  console.log("\n=== 2. Testing check-hash on /api/v1/media (Fake Hash) ===");
  const res2 = await fetch(`http://127.0.0.1:5010/api/v1/media/check-hash/${fakeHash}`);
  console.log("Status:", res2.status);
  console.log("Response:", await res2.json());

  console.log("\n=== 3. Testing check-hash on /api/v1/file-upload (Existing Hash with Auth) ===");
  const res3 = await fetch(`http://127.0.0.1:5010/api/v1/file-upload/check-hash/${existingHash}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  console.log("Status:", res3.status);
  console.log("Response:", await res3.json());
}

testCheckHash().catch(console.error);
