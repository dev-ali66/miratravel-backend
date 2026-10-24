import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const VPS_BASE_URL = "https://api.miratravel.nl/multimedia/uploads";

async function main() {
  const assets = await prisma.mediaAsset.findMany();
  console.log(`📡 Verifying live HTTP status on Hostinger VPS for all ${assets.length} assets...\n`);

  let ok200 = 0;
  let failedCount = 0;
  const failedList: any[] = [];

  const queue = [...assets];
  const CONCURRENCY = 4;

  const workers = Array.from({ length: CONCURRENCY }, async () => {
    while (queue.length > 0) {
      const a = queue.shift();
      if (!a) break;

      const targetUrl = a.url.startsWith("http")
        ? a.url
        : `${VPS_BASE_URL}/${a.fileName}`;

      let retries = 3;
      let success = false;
      let lastErr = "";
      let lastStatus = 0;

      while (retries > 0 && !success) {
        try {
          const res = await fetch(targetUrl, { method: "GET" });
          if (res.status === 200) {
            ok200++;
            success = true;
          } else {
            lastStatus = res.status;
            retries--;
            await new Promise((r) => setTimeout(r, 100));
          }
        } catch (err: any) {
          lastErr = err.message;
          retries--;
          await new Promise((r) => setTimeout(r, 200));
        }
      }

      if (!success) {
        failedCount++;
        failedList.push({ file: a.fileName, url: targetUrl, status: lastStatus, error: lastErr });
      }
    }
  });

  await Promise.all(workers);

  console.log("==========================================================");
  console.log("🎉 LIVE HOSTINGER VPS HTTP VERIFICATION REPORT:");
  console.log(`   - Total Assets Tested: ${assets.length}`);
  console.log(`   - HTTP 200 OK:         ${ok200} (${((ok200 / assets.length) * 100).toFixed(1)}%)`);
  console.log(`   - HTTP 404 / Failed:   ${failedCount}`);
  console.log("==========================================================\n");

  if (failedList.length > 0) {
    console.log("Failed Assets:", failedList);
  } else {
    console.log("🌟 100% PERFECT! ALL ASSETS RETURN HTTP 200 OK FROM VPS!");
  }

  await prisma.$disconnect();
}

main().catch(console.error);
