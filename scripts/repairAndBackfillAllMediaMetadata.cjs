/**
 * scripts/repairAndBackfillAllMediaMetadata.cjs
 * 
 * Exhaustively audits all MediaAssets in PostgreSQL:
 * 1. Finds assets with size === 0, width === null, height === null, or hash === null.
 * 2. Ensures the physical file exists locally in multimedia/uploads/ (pulls from live VPS if missing).
 * 3. Extracts exact byte size, computes SHA-256 hash, and parses width/height dimensions.
 * 4. Updates database records so 100% of assets display authentic size and dimensions.
 */
const { PrismaClient } = require("@prisma/client");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const prisma = new PrismaClient();
const UPLOAD_DIR = path.resolve(process.cwd(), "multimedia", "uploads");
const VPS_BASE_URL = "https://api.miratravel.nl/multimedia/uploads";

/**
 * Fast zero-dependency image dimension extractor
 */
function extractImageDimensions(buffer, mimeType) {
  try {
    if (!mimeType || !mimeType.startsWith("image/") || buffer.length < 10) {
      return { width: null, height: null };
    }

    // 1. PNG
    if (buffer.length >= 24 && buffer.toString("ascii", 12, 16) === "IHDR") {
      const width = buffer.readUInt32BE(16);
      const height = buffer.readUInt32BE(20);
      return { width, height };
    }

    // 2. GIF
    if (buffer.length >= 10 && buffer.toString("ascii", 0, 3) === "GIF") {
      const width = buffer.readUInt16LE(6);
      const height = buffer.readUInt16LE(8);
      return { width, height };
    }

    // 3. WebP
    if (
      buffer.length >= 30 &&
      buffer.toString("ascii", 0, 4) === "RIFF" &&
      buffer.toString("ascii", 8, 12) === "WEBP"
    ) {
      const chunkHeader = buffer.toString("ascii", 12, 16);
      if (chunkHeader === "VP8 " && buffer.length >= 30) {
        const width = buffer.readUInt16LE(26) & 0x3fff;
        const height = buffer.readUInt16LE(28) & 0x3fff;
        return { width, height };
      } else if (chunkHeader === "VP8L" && buffer.length >= 25) {
        const b0 = buffer[21];
        const b1 = buffer[22];
        const b2 = buffer[23];
        const b3 = buffer[24];
        const width = 1 + (((b1 & 0x3f) << 8) | b0);
        const height = 1 + (((b3 & 0x0f) << 10) | (b2 << 2) | ((b1 & 0xc0) >> 6));
        return { width, height };
      } else if (chunkHeader === "VP8X" && buffer.length >= 30) {
        const width = 1 + (buffer[24] | (buffer[25] << 8) | (buffer[26] << 16));
        const height = 1 + (buffer[27] | (buffer[28] << 8) | (buffer[29] << 16));
        return { width, height };
      }
    }

    // 4. JPEG
    if (buffer.length >= 4 && buffer[0] === 0xff && buffer[1] === 0xd8) {
      let offset = 2;
      while (offset < buffer.length - 8) {
        if (buffer[offset] !== 0xff) break;
        const marker = buffer[offset + 1];
        const len = buffer.readUInt16BE(offset + 2);
        if (
          (marker >= 0xc0 && marker <= 0xc3) ||
          (marker >= 0xc5 && marker <= 0xc7) ||
          (marker >= 0xc9 && marker <= 0xcb) ||
          (marker >= 0xcd && marker <= 0xcf)
        ) {
          const height = buffer.readUInt16BE(offset + 5);
          const width = buffer.readUInt16BE(offset + 7);
          return { width, height };
        }
        offset += 2 + len;
      }
    }

    // 5. SVG viewBox / width / height regex
    if (mimeType.includes("svg") || buffer.toString("utf8", 0, 100).includes("<svg")) {
      const text = buffer.toString("utf8", 0, 1000);
      const viewBoxMatch = text.match(/viewBox=["']\s*[\d.-]+\s+[\d.-]+\s+([\d.-]+)\s+([\d.-]+)\s*["']/i);
      if (viewBoxMatch) {
        return { width: Math.round(parseFloat(viewBoxMatch[1])), height: Math.round(parseFloat(viewBoxMatch[2])) };
      }
      const wMatch = text.match(/width=["']([\d.-]+)(?:px)?["']/i);
      const hMatch = text.match(/height=["']([\d.-]+)(?:px)?["']/i);
      if (wMatch && hMatch) {
        return { width: Math.round(parseFloat(wMatch[1])), height: Math.round(parseFloat(hMatch[2])) };
      }
    }
  } catch (e) {
    // ignore parse errors
  }
  return { width: null, height: null };
}

async function fetchFromVps(fileName) {
  const url = `${VPS_BASE_URL}/${fileName}`;
  let retries = 3;
  while (retries > 0) {
    try {
      const res = await fetch(url);
      if (res.ok) {
        const arr = await res.arrayBuffer();
        return Buffer.from(arr);
      }
    } catch {
      // retry
    }
    retries--;
    await new Promise((r) => setTimeout(r, 200));
  }
  return null;
}

async function main() {
  console.log("===============================================================================");
  console.log("🛠️ REPAIRING & BACKFILLING ALL MEDIA ASSET SIZES & DIMENSIONS");
  console.log("===============================================================================\n");

  const allAssets = await prisma.mediaAsset.findMany();
  console.log(`Found ${allAssets.length} total media assets in database.\n`);

  let updatedCount = 0;
  let alreadyComplete = 0;
  let missingFiles = 0;

  for (const asset of allAssets) {
    const needsSize = !asset.size || asset.size === 0;
    const isImage = asset.mimeType && asset.mimeType.startsWith("image/");
    const needsDimensions = isImage && (!asset.width || !asset.height);
    const needsHash = !asset.hash;

    if (!needsSize && !needsDimensions && !needsHash) {
      alreadyComplete++;
      continue;
    }

    const localPath = path.resolve(UPLOAD_DIR, asset.fileName);
    let buffer = null;

    if (fs.existsSync(localPath)) {
      buffer = fs.readFileSync(localPath);
    } else {
      // Try fetching from VPS
      console.log(`  ⬇️ Fetching missing physical file "${asset.fileName}" from VPS...`);
      buffer = await fetchFromVps(asset.fileName);
      if (buffer) {
        fs.writeFileSync(localPath, buffer);
        console.log(`    ✓ Saved "${asset.fileName}" to local disk (${buffer.length} bytes).`);
      } else {
        console.warn(`    ⚠️ Could not fetch "${asset.fileName}" from VPS or local disk.`);
        missingFiles++;
        continue;
      }
    }

    const calculatedSize = buffer.length;
    const calculatedHash = crypto.createHash("sha256").update(buffer).digest("hex");
    const dimensions = isImage ? extractImageDimensions(buffer, asset.mimeType) : { width: null, height: null };

    const updateData = {};
    if (needsSize || asset.size !== calculatedSize) {
      updateData.size = calculatedSize;
    }
    if (needsHash || asset.hash !== calculatedHash) {
      updateData.hash = calculatedHash;
    }
    if (dimensions.width && (!asset.width || asset.width !== dimensions.width)) {
      updateData.width = dimensions.width;
    }
    if (dimensions.height && (!asset.height || asset.height !== dimensions.height)) {
      updateData.height = dimensions.height;
    }

    if (Object.keys(updateData).length > 0) {
      await prisma.mediaAsset.update({
        where: { id: asset.id },
        data: updateData,
      });

      console.log(
        `  ✅ Updated "${asset.fileName}": size=${updateData.size || asset.size} B, dimensions=${updateData.width || asset.width}×${updateData.height || asset.height}, hash=${(updateData.hash || asset.hash || "").substring(0, 8)}...`
      );
      updatedCount++;
    }
  }

  console.log("\n===============================================================================");
  console.log(`🎉 BACKFILL COMPLETED:`);
  console.log(`  • Successfully Updated: ${updatedCount} assets`);
  console.log(`  • Already Complete:     ${alreadyComplete} assets`);
  console.log(`  • Missing on VPS/Disk:  ${missingFiles} assets`);
  console.log("===============================================================================\n");

  // Final check: count any remaining size === 0 assets
  const zeroSizeCount = await prisma.mediaAsset.count({
    where: { size: 0 },
  });
  console.log(`Remaining assets with size 0: ${zeroSizeCount}`);
}

main()
  .catch((e) => {
    console.error("FATAL ERROR:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
