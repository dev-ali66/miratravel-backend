import "dotenv/config";
import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const SSH_KEY = "C:\\Users\\aalia\\.ssh\\backend-miratravel";
const VPS_HOST = "root@179.198.213.105";
const VPS_UPLOADS_DIR = "/var/www/miratravel/multimedia/uploads";

const uploadsDir = path.resolve(process.cwd(), "multimedia/uploads");
const stagingDir = path.resolve(process.cwd(), "staging_db_assets");
const archivePath = path.resolve(process.cwd(), "db_assets.tar.gz");

async function main() {
  console.log("==========================================================");
  console.log("🚀 MIRA Travel — Packaging & Deploying 100% of DB Assets to VPS");
  console.log("==========================================================\n");

  // Read VPS files
  let vpsFiles = new Set<string>();
  if (fs.existsSync("vps_files.txt")) {
    const raw = fs.readFileSync("vps_files.txt", "utf16le");
    const lines = raw.split(/\r?\n/).map((s) => s.trim().replace(/^\uFEFF/, "")).filter(Boolean);
    vpsFiles = new Set(lines);
  }

  const assets = await prisma.mediaAsset.findMany();
  console.log(`📊 Total MediaAsset records in DB: ${assets.length}`);

  const toUpload: string[] = [];
  let totalBytes = 0;

  for (const a of assets) {
    if (!vpsFiles.has(a.fileName)) {
      const p = path.join(uploadsDir, a.fileName);
      if (fs.existsSync(p)) {
        toUpload.push(a.fileName);
        totalBytes += fs.statSync(p).size;
      }
    }
  }

  // Also include w3ilqosvlwlrcsm82cqp.jpg explicitly if present
  if (fs.existsSync(path.join(uploadsDir, "w3ilqosvlwlrcsm82cqp.jpg")) && !toUpload.includes("w3ilqosvlwlrcsm82cqp.jpg")) {
    toUpload.push("w3ilqosvlwlrcsm82cqp.jpg");
  }

  console.log(`📦 Assets needing upload to VPS: ${toUpload.length} (${(totalBytes / (1024 * 1024)).toFixed(2)} MB)`);

  if (toUpload.length === 0) {
    console.log("🎉 All DB assets already exist on VPS!");
    return;
  }

  // Setup staging
  if (fs.existsSync(stagingDir)) {
    fs.rmSync(stagingDir, { recursive: true, force: true });
  }
  fs.mkdirSync(stagingDir, { recursive: true });

  console.log("📋 Staging assets...");
  for (const f of toUpload) {
    const src = path.join(uploadsDir, f);
    const dest = path.join(stagingDir, f);
    fs.copyFileSync(src, dest);
  }

  // Tar
  if (fs.existsSync(archivePath)) {
    fs.unlinkSync(archivePath);
  }
  console.log("🗜️ Compressing assets into db_assets.tar.gz...");
  execSync(`tar -czf "${archivePath}" -C "${stagingDir}" .`);
  const archiveSize = fs.statSync(archivePath).size;
  console.log(`   ✓ Archive size: ${(archiveSize / (1024 * 1024)).toFixed(2)} MB`);

  // SCP to VPS
  console.log("📤 Uploading db_assets.tar.gz to VPS /tmp via SCP...");
  execSync(`scp -i "${SSH_KEY}" -o StrictHostKeyChecking=no "${archivePath}" "${VPS_HOST}:/tmp/db_assets.tar.gz"`);
  console.log("   ✓ Uploaded to VPS!");

  // Extract on VPS
  console.log("📂 Extracting assets on VPS into /var/www/miratravel/multimedia/uploads/...");
  const remoteCmd = `tar -xzf /tmp/db_assets.tar.gz -C ${VPS_UPLOADS_DIR} && chmod -R 755 ${VPS_UPLOADS_DIR} && rm -f /tmp/db_assets.tar.gz && ls -1 ${VPS_UPLOADS_DIR} | wc -l`;
  const remoteOutput = execSync(`ssh -n -i "${SSH_KEY}" -o StrictHostKeyChecking=no "${VPS_HOST}" "${remoteCmd}"`, { encoding: "utf8" });
  console.log(`   ✓ Total files now on VPS: ${remoteOutput.trim()}`);

  // Cleanup local
  fs.rmSync(stagingDir, { recursive: true, force: true });
  fs.unlinkSync(archivePath);
  console.log("🧹 Cleaned up temporary archive.");

  console.log("\n==========================================================");
  console.log("🎉 DEPLOYMENT TO VPS COMPLETE!");
  console.log("==========================================================\n");

  await prisma.$disconnect();
}

main().catch(console.error);
