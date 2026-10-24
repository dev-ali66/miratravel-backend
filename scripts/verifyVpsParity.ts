import { execSync } from "child_process";
import fs from "fs";
import path from "path";

const SSH_KEY = "C:\\Users\\aalia\\.ssh\\backend-miratravel";
const VPS_USER = "root";
const VPS_HOST = "179.198.213.105";
const VPS_UPLOAD_DIR = "/var/www/miratravel/multimedia/uploads";

async function main() {
  const localUploadDir = path.resolve(process.cwd(), "multimedia/uploads");
  const localFiles = fs.readdirSync(localUploadDir);

  const rawVpsList = execSync(
    `ssh -i "${SSH_KEY}" -o StrictHostKeyChecking=no ${VPS_USER}@${VPS_HOST} "ls -1 ${VPS_UPLOAD_DIR}"`,
    { encoding: "utf8" }
  );
  const vpsFiles = new Set(
    rawVpsList
      .trim()
      .split(/\r?\n/)
      .map((s) => s.trim())
      .filter(Boolean)
  );

  const missing = localFiles.filter((f) => !vpsFiles.has(f));

  console.log("====================================================================");
  console.log(`📁 Local multimedia/uploads: ${localFiles.length} files`);
  console.log(`🌐 VPS /var/www/miratravel/multimedia/uploads: ${vpsFiles.size} files`);
  console.log(`🎯 Missing on VPS: ${missing.length}`);
  if (missing.length > 0) {
    console.log("Sample missing:", missing.slice(0, 5));
  } else {
    console.log("✨ 100% COMPLETE PARITY! All local files exist on Hostinger VPS!");
  }
  console.log("====================================================================");
}

main().catch(console.error);
