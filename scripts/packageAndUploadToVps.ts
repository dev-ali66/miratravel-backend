import fs from "fs";
import path from "path";
import { execSync } from "child_process";

const SSH_KEY = "C:\\Users\\aalia\\.ssh\\backend-miratravel";
const VPS_HOST = "root@179.198.213.105";
const VPS_UPLOADS_DIR = "/var/www/miratravel/multimedia/uploads";

const uploadsDir = path.resolve(process.cwd(), "multimedia/uploads");
const stagingDir = path.resolve(process.cwd(), "staging_vps");
const tarArchive = path.resolve(process.cwd(), "sync_to_vps.tar.gz");

async function main() {
  console.log("==========================================================");
  console.log("🚀 MIRA Travel — Packaging & Deploying Media to VPS");
  console.log("==========================================================\n");

  // Step 1: Read current VPS files
  let vpsFiles = new Set<string>();
  if (fs.existsSync("vps_files.txt")) {
    const raw = fs.readFileSync("vps_files.txt", "utf16le");
    const lines = raw.split(/\r?\n/).map((s) => s.trim().replace(/^\uFEFF/, "")).filter(Boolean);
    vpsFiles = new Set(lines);
    console.log(`📡 Current files on VPS: ${vpsFiles.size}`);
  }

  // Step 2: Identify files to upload
  const localFiles = fs.readdirSync(uploadsDir);
  console.log(`📁 Local files in multimedia/uploads: ${localFiles.length}`);

  const toUpload: string[] = [];
  for (const f of localFiles) {
    if (!vpsFiles.has(f)) {
      toUpload.push(f);
    }
  }

  console.log(`📦 New files to transfer to VPS: ${toUpload.length}`);
  if (toUpload.length === 0) {
    console.log("🎉 All files are already on the VPS! Nothing to upload.");
    return;
  }

  // Step 3: Prepare staging directory
  if (fs.existsSync(stagingDir)) {
    fs.rmSync(stagingDir, { recursive: true, force: true });
  }
  fs.mkdirSync(stagingDir, { recursive: true });

  console.log("📋 Staging files for tar archive...");
  let totalBytes = 0;
  for (const f of toUpload) {
    const src = path.join(uploadsDir, f);
    const dest = path.join(stagingDir, f);
    fs.copyFileSync(src, dest);
    totalBytes += fs.statSync(src).size;
  }
  console.log(`   ✓ Staged ${toUpload.length} files (${(totalBytes / (1024 * 1024)).toFixed(2)} MB)`);

  // Step 4: Create tar.gz archive
  if (fs.existsSync(tarArchive)) {
    fs.unlinkSync(tarArchive);
  }
  console.log("🗜️ Creating compressed tar.gz archive...");
  execSync(`tar -czf "${tarArchive}" -C "${stagingDir}" .`, { stdio: "inherit" });
  const archiveSize = fs.statSync(tarArchive).size;
  console.log(`   ✓ Archive created: ${(archiveSize / (1024 * 1024)).toFixed(2)} MB`);

  // Step 5: SCP archive to VPS /tmp
  console.log(`\n📤 Uploading ${path.basename(tarArchive)} to VPS /tmp via SCP...`);
  const scpCmd = `scp -i "${SSH_KEY}" -o StrictHostKeyChecking=no "${tarArchive}" "${VPS_HOST}:/tmp/sync_to_vps.tar.gz"`;
  execSync(scpCmd, { stdio: "inherit" });
  console.log("   ✓ Upload complete!");

  // Step 6: Untar on VPS and set permissions
  console.log("📂 Extracting archive on VPS into uploads directory...");
  const remoteCmds = [
    `tar -xzf /tmp/sync_to_vps.tar.gz -C ${VPS_UPLOADS_DIR}`,
    `chmod -R 755 ${VPS_UPLOADS_DIR}`,
    `rm -f /tmp/sync_to_vps.tar.gz`,
    `ls -1 ${VPS_UPLOADS_DIR} | wc -l`,
  ].join(" && ");

  const sshCmd = `ssh -n -i "${SSH_KEY}" -o StrictHostKeyChecking=no "${VPS_HOST}" "${remoteCmds}"`;
  const remoteOutput = execSync(sshCmd, { encoding: "utf8" });
  console.log(`   ✓ Remote file count in ${VPS_UPLOADS_DIR}: ${remoteOutput.trim()}`);

  // Step 7: Clean up local staging and tar
  console.log("\n🧹 Cleaning up local temporary staging files...");
  fs.rmSync(stagingDir, { recursive: true, force: true });
  fs.unlinkSync(tarArchive);
  console.log("   ✓ Cleaned up.");

  console.log("\n==========================================================");
  console.log("🎉 ALL MEDIA SUCCESSFULLY DEPLOYED TO HOSTINGER VPS!");
  console.log("==========================================================\n");
}

main().catch(console.error);
