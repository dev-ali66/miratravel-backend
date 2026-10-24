import "dotenv/config";
import fs from "fs";
import path from "path";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const vpsFiles = new Set(
    fs
      .readFileSync("vps_files.txt", "utf16le")
      .split(/\r?\n/)
      .map((s) => s.trim().replace(/^\uFEFF/, ""))
      .filter(Boolean)
  );
  const assets = await prisma.mediaAsset.findMany();
  const uploadsDir = path.resolve(process.cwd(), "multimedia/uploads");
  const stagingDir = path.resolve(process.cwd(), "staging_db");

  if (fs.existsSync(stagingDir)) {
    fs.rmSync(stagingDir, { recursive: true, force: true });
  }
  fs.mkdirSync(stagingDir, { recursive: true });

  let count = 0;
  let totalBytes = 0;

  for (const a of assets) {
    if (!vpsFiles.has(a.fileName)) {
      const src = path.join(uploadsDir, a.fileName);
      if (fs.existsSync(src)) {
        fs.copyFileSync(src, path.join(stagingDir, a.fileName));
        count++;
        totalBytes += fs.statSync(src).size;
      }
    }
  }

  // Ensure w3ilqosvlwlrcsm82cqp.jpg is staged
  const target = "w3ilqosvlwlrcsm82cqp.jpg";
  if (
    fs.existsSync(path.join(uploadsDir, target)) &&
    !fs.existsSync(path.join(stagingDir, target))
  ) {
    fs.copyFileSync(path.join(uploadsDir, target), path.join(stagingDir, target));
    count++;
  }

  console.log(`✓ Staged ${count} files (${(totalBytes / (1024 * 1024)).toFixed(2)} MB) in ${stagingDir}`);
  await prisma.$disconnect();
}

main().catch(console.error);
