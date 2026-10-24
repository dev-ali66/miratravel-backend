import fs from "fs";
import path from "path";

const uploadsDir = path.resolve(process.cwd(), "multimedia/uploads");
const cldImgDir = path.resolve(process.cwd(), "../cloudinary/image");
const cldVidDir = path.resolve(process.cwd(), "../cloudinary/video");
const rootImagesDir = path.resolve(process.cwd(), "../images");

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

function copyAllFrom(srcDir: string, tag: string) {
  if (!fs.existsSync(srcDir)) {
    console.log(`⚠️ ${tag} directory does not exist: ${srcDir}`);
    return 0;
  }
  const files = fs.readdirSync(srcDir);
  let copied = 0;
  for (const f of files) {
    const srcPath = path.join(srcDir, f);
    if (!fs.statSync(srcPath).isFile()) continue;

    const destPath = path.join(uploadsDir, f);
    if (!fs.existsSync(destPath)) {
      fs.copyFileSync(srcPath, destPath);
      copied++;
    }
  }
  console.log(`✓ Copied ${copied} new files from ${tag} (${files.length} total in src).`);
  return copied;
}

function main() {
  console.log("==========================================================");
  console.log("🚀 Consolidating all media into local multimedia/uploads");
  console.log("==========================================================\n");

  const beforeCount = fs.readdirSync(uploadsDir).length;
  console.log(`Initial files in multimedia/uploads: ${beforeCount}`);

  copyAllFrom(cldImgDir, "cloudinary/image");
  copyAllFrom(cldVidDir, "cloudinary/video");
  copyAllFrom(rootImagesDir, "images");

  const afterCount = fs.readdirSync(uploadsDir).length;
  console.log(`\n🎉 Consolidation complete! Total files in multimedia/uploads: ${afterCount} (+${afterCount - beforeCount} added)`);
}

main();
