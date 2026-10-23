import path from "path";
import fs from "fs";
import crypto from "crypto";

const BACKUP_ROOT = path.resolve(process.cwd(), "../cloudinary");
const IMAGE_DIR = path.join(BACKUP_ROOT, "image");
const VIDEO_DIR = path.join(BACKUP_ROOT, "video");
const FILES_DIR = path.join(BACKUP_ROOT, "files");

const formatBytes = (bytes) => {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
};

/**
 * Calculates SHA-256 hash of a file buffer or stream
 */
function getFileHash(filePath) {
  const buffer = fs.readFileSync(filePath);
  return crypto.createHash("sha256").update(buffer).digest("hex");
}

async function deduplicateFolder(folderName, folderPath) {
  if (!fs.existsSync(folderPath)) {
    console.log(`Directory ${folderPath} does not exist. Skipping.`);
    return { total: 0, unique: 0, removed: 0, freedBytes: 0, duplicatesList: [] };
  }

  const entries = fs.readdirSync(folderPath).filter((f) => {
    const full = path.join(folderPath, f);
    return fs.statSync(full).isFile();
  });

  console.log(`\n==============================================================`);
  console.log(`🔍 Scanning '${folderName}' (${entries.length} files) for exact SHA-256 blob duplicates...`);
  console.log(`==============================================================`);

  const hashMap = new Map(); // hash -> Array of file objects

  for (let i = 0; i < entries.length; i++) {
    const fileName = entries[i];
    const fullPath = path.join(folderPath, fileName);
    const size = fs.statSync(fullPath).size;
    const hash = getFileHash(fullPath);

    if (!hashMap.has(hash)) {
      hashMap.set(hash, []);
    }
    hashMap.get(hash).push({ fileName, fullPath, size });

    if ((i + 1) % 50 === 0 || i + 1 === entries.length) {
      process.stdout.write(`   Hashed ${i + 1}/${entries.length} files...\r`);
    }
  }
  console.log("");

  let removedCount = 0;
  let freedBytes = 0;
  const duplicatesList = [];

  for (const [hash, files] of hashMap.entries()) {
    if (files.length > 1) {
      // Keep the first one as canonical
      const canonical = files[0];
      const dupes = files.slice(1);

      console.log(`\nFound ${files.length} identical copies (SHA-256: ${hash.slice(0, 12)}..., size: ${formatBytes(canonical.size)}):`);
      console.log(`   🌟 KEEPING : ${canonical.fileName}`);

      for (const dupe of dupes) {
        console.log(`   🗑️  REMOVING: ${dupe.fileName}`);
        try {
          fs.unlinkSync(dupe.fullPath);
          removedCount++;
          freedBytes += dupe.size;
          duplicatesList.push({
            folder: folderName,
            removedFile: dupe.fileName,
            keptFile: canonical.fileName,
            size: dupe.size,
            hash: hash,
          });
        } catch (err) {
          console.error(`   ❌ Failed to delete ${dupe.fileName}:`, err.message);
        }
      }
    }
  }

  const uniqueCount = hashMap.size;

  console.log(`\n📊 Results for '${folderName}':`);
  console.log(`   - Total Scanned : ${entries.length}`);
  console.log(`   - Unique Files  : ${uniqueCount}`);
  console.log(`   - Duplicates Cut: ${removedCount}`);
  console.log(`   - Space Freed   : ${formatBytes(freedBytes)}`);

  return {
    total: entries.length,
    unique: uniqueCount,
    removed: removedCount,
    freedBytes,
    duplicatesList,
  };
}

async function main() {
  console.log("==============================================================");
  console.log("🧹 MIRA TRAVEL - CLOUDINARY MEDIA DEDUPLICATION TOOL");
  console.log("==============================================================");
  console.log(`Target Directory : ${BACKUP_ROOT}`);
  console.log(`Method           : Cryptographic SHA-256 Blob Content Hash`);
  console.log("==============================================================");

  const imageStats = await deduplicateFolder("image", IMAGE_DIR);
  const videoStats = await deduplicateFolder("video", VIDEO_DIR);
  const filesStats = await deduplicateFolder("files", FILES_DIR);

  const totalRemoved = imageStats.removed + videoStats.removed + filesStats.removed;
  const totalFreed = imageStats.freedBytes + videoStats.freedBytes + filesStats.freedBytes;
  const allDuplicates = [
    ...imageStats.duplicatesList,
    ...videoStats.duplicatesList,
    ...filesStats.duplicatesList,
  ];

  // Update manifest.json with duplicate mapping
  const manifestPath = path.join(BACKUP_ROOT, "manifest.json");
  if (fs.existsSync(manifestPath)) {
    try {
      const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
      manifest.deduplication = {
        last_run: new Date().toISOString(),
        total_duplicates_removed: totalRemoved,
        space_freed: formatBytes(totalFreed),
        duplicates_mapping: allDuplicates,
      };

      // Also update assets status in manifest if file was removed as dupe
      const dupeFileNames = new Map(allDuplicates.map((d) => [d.removedFile, d.keptFile]));
      if (Array.isArray(manifest.assets)) {
        for (const asset of manifest.assets) {
          const fileName = path.basename(asset.local_file_path || "");
          if (dupeFileNames.has(fileName)) {
            const canonicalName = dupeFileNames.get(fileName);
            asset.status = "deduplicated_alias";
            asset.canonical_file = canonicalName;
            asset.local_file_path = path.join(
              path.dirname(asset.local_file_path),
              canonicalName,
            );
          }
        }
      }

      fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), "utf-8");
      console.log(`\n📝 manifest.json successfully updated with deduplication metadata!`);
    } catch (e) {
      console.warn("Could not update manifest.json:", e.message);
    }
  }

  const finalImages = fs.existsSync(IMAGE_DIR)
    ? fs.readdirSync(IMAGE_DIR).filter((f) => fs.statSync(path.join(IMAGE_DIR, f)).isFile()).length
    : 0;
  const finalVideos = fs.existsSync(VIDEO_DIR)
    ? fs.readdirSync(VIDEO_DIR).filter((f) => fs.statSync(path.join(VIDEO_DIR, f)).isFile()).length
    : 0;

  console.log("\n==============================================================");
  console.log("🎉 DEDUPLICATION COMPLETE!");
  console.log("==============================================================");
  console.log(`📁 Final Unique Images : ${finalImages} files`);
  console.log(`📁 Final Unique Videos : ${finalVideos} files`);
  console.log(`🗑️ Total Duplicates Cut: ${totalRemoved} files`);
  console.log(`💾 Total Storage Freed : ${formatBytes(totalFreed)}`);
  console.log("==============================================================\n");
}

main().catch(console.error);
