import { execSync } from "child_process";
import fs from "fs";
import path from "path";

const SSH_KEY = "C:\\Users\\aalia\\.ssh\\backend-miratravel";
const VPS_USER = "root";
const VPS_HOST = "179.198.213.105";
const VPS_UPLOAD_DIR = "/var/www/miratravel/multimedia/uploads";

async function main() {
  console.log("====================================================================");
  console.log("🚀 Staging and Syncing All Remaining Local Media to Hostinger VPS");
  console.log("====================================================================\n");

  // 1. Fetch current file list from VPS
  console.log("📡 Fetching existing file list from Hostinger VPS...");
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
  console.log(`   ✓ Found ${vpsFiles.size} files currently on VPS.`);

  // 2. Identify local files missing on VPS
  const localUploadDir = path.resolve(process.cwd(), "multimedia/uploads");
  const localFiles = fs.readdirSync(localUploadDir);
  const missingFiles = localFiles.filter((f) => !vpsFiles.has(f));

  console.log(`📁 Local total files in multimedia/uploads: ${localFiles.length}`);
  console.log(`📦 Missing on VPS: ${missingFiles.length}`);

  if (missingFiles.length === 0) {
    console.log("🎉 All local files are already present on VPS! Nothing to upload.");
    return;
  }

  // Split into images and videos
  const missingImages: string[] = [];
  const missingVideos: string[] = [];

  for (const f of missingFiles) {
    const ext = path.extname(f).toLowerCase();
    if (ext === ".mp4" || ext === ".webm" || ext === ".mov") {
      missingVideos.push(f);
    } else {
      missingImages.push(f);
    }
  }

  console.log(`   - Missing Images: ${missingImages.length}`);
  console.log(`   - Missing Videos: ${missingVideos.length}`);

  // 3. Stage & upload images
  if (missingImages.length > 0) {
    const stageImgDir = path.resolve(process.cwd(), "staging_rem_images");
    if (fs.existsSync(stageImgDir)) fs.rmSync(stageImgDir, { recursive: true, force: true });
    fs.mkdirSync(stageImgDir, { recursive: true });

    let imgBytes = 0;
    for (const f of missingImages) {
      const src = path.join(localUploadDir, f);
      const dest = path.join(stageImgDir, f);
      fs.copyFileSync(src, dest);
      imgBytes += fs.statSync(src).size;
    }
    console.log(`\n📦 Staged ${missingImages.length} images (${(imgBytes / 1024 / 1024).toFixed(2)} MB).`);

    const imgTar = path.resolve(process.cwd(), "rem_images.tar.gz");
    if (fs.existsSync(imgTar)) fs.unlinkSync(imgTar);

    console.log("🗜️ Compressing images tarball...");
    execSync(`tar -czf "${imgTar}" -C "${stageImgDir}" .`);
    const tarSize = (fs.statSync(imgTar).size / 1024 / 1024).toFixed(2);
    console.log(`   ✓ rem_images.tar.gz created (${tarSize} MB).`);

    console.log("📤 Transferring images to VPS via SCP...");
    execSync(`scp -i "${SSH_KEY}" -o StrictHostKeyChecking=no "${imgTar}" ${VPS_USER}@${VPS_HOST}:/tmp/rem_images.tar.gz`);
    console.log("   ✓ Transfer complete.");

    console.log("📂 Extracting images on VPS...");
    execSync(
      `ssh -i "${SSH_KEY}" -o StrictHostKeyChecking=no ${VPS_USER}@${VPS_HOST} "tar -xzf /tmp/rem_images.tar.gz -C ${VPS_UPLOAD_DIR} && rm /tmp/rem_images.tar.gz"`
    );
    console.log("   ✓ Images extracted on VPS.");

    // Cleanup
    fs.rmSync(stageImgDir, { recursive: true, force: true });
    fs.unlinkSync(imgTar);
  }

  // 4. Stage & upload videos
  if (missingVideos.length > 0) {
    const stageVidDir = path.resolve(process.cwd(), "staging_rem_videos");
    if (fs.existsSync(stageVidDir)) fs.rmSync(stageVidDir, { recursive: true, force: true });
    fs.mkdirSync(stageVidDir, { recursive: true });

    let vidBytes = 0;
    for (const f of missingVideos) {
      const src = path.join(localUploadDir, f);
      const dest = path.join(stageVidDir, f);
      fs.copyFileSync(src, dest);
      vidBytes += fs.statSync(src).size;
    }
    console.log(`\n🎥 Staged ${missingVideos.length} videos (${(vidBytes / 1024 / 1024).toFixed(2)} MB).`);

    const vidTar = path.resolve(process.cwd(), "rem_videos.tar.gz");
    if (fs.existsSync(vidTar)) fs.unlinkSync(vidTar);

    console.log("🗜️ Compressing videos tarball...");
    execSync(`tar -czf "${vidTar}" -C "${stageVidDir}" .`);
    const tarSize = (fs.statSync(vidTar).size / 1024 / 1024).toFixed(2);
    console.log(`   ✓ rem_videos.tar.gz created (${tarSize} MB).`);

    console.log("📤 Transferring videos to VPS via SCP...");
    execSync(`scp -i "${SSH_KEY}" -o StrictHostKeyChecking=no "${vidTar}" ${VPS_USER}@${VPS_HOST}:/tmp/rem_videos.tar.gz`);
    console.log("   ✓ Transfer complete.");

    console.log("📂 Extracting videos on VPS...");
    execSync(
      `ssh -i "${SSH_KEY}" -o StrictHostKeyChecking=no ${VPS_USER}@${VPS_HOST} "tar -xzf /tmp/rem_videos.tar.gz -C ${VPS_UPLOAD_DIR} && rm /tmp/rem_videos.tar.gz"`
    );
    console.log("   ✓ Videos extracted on VPS.");

    // Cleanup
    fs.rmSync(stageVidDir, { recursive: true, force: true });
    fs.unlinkSync(vidTar);
  }

  // 5. Fix permissions on VPS
  console.log("\n🔒 Setting 755 permissions on VPS...");
  execSync(`ssh -i "${SSH_KEY}" -o StrictHostKeyChecking=no ${VPS_USER}@${VPS_HOST} "chmod -R 755 ${VPS_UPLOAD_DIR}"`);

  // 6. Verify final count
  const finalCount = execSync(
    `ssh -i "${SSH_KEY}" -o StrictHostKeyChecking=no ${VPS_USER}@${VPS_HOST} "ls -1 ${VPS_UPLOAD_DIR} | wc -l"`,
    { encoding: "utf8" }
  ).trim();

  console.log(`\n====================================================================`);
  console.log(`🎉 Sync Completed! Total files on VPS /var/www/miratravel/multimedia/uploads: ${finalCount}`);
  console.log(`====================================================================\n`);
}

main().catch(console.error);
