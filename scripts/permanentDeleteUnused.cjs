const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const { getUploadsDir, deleteFromLocalStorage } = require('../dist/src/shared/upload_local.service.js');

const prisma = new PrismaClient();
const DRY_RUN = process.argv.includes('--execute') ? false : true;

async function main() {
  console.log(`\n======================================================`);
  console.log(`🗑️  PERMANENT DELETE UNUSED MEDIA ASSETS`);
  console.log(`Mode: ${DRY_RUN ? '🛡️  DRY RUN (Preview only, no writes)' : '🚀 LIVE EXECUTION (Permanently purging from DB and disk)'}`);
  console.log(`======================================================\n`);

  // 1. Fetch all unused media assets (0 references)
  const unusedAssets = await prisma.mediaAsset.findMany({
    where: {
      references: { none: {} },
    },
    include: {
      _count: { select: { references: true } },
    },
    orderBy: { createdAt: 'asc' },
  });

  console.log(`Total unused media assets found: ${unusedAssets.length}`);

  // 2. Fetch all in-use media assets to verify safety
  const inUseAssets = await prisma.mediaAsset.findMany({
    where: {
      references: { some: {} },
    },
    select: {
      id: true,
      fileName: true,
      url: true,
      storagePath: true,
    },
  });

  const inUseFileNames = new Set(inUseAssets.map((a) => a.fileName));
  const inUseUrls = new Set(inUseAssets.map((a) => a.url));
  const inUsePaths = new Set(inUseAssets.map((a) => a.storagePath).filter(Boolean));

  console.log(`Total in-use media assets: ${inUseAssets.length}`);

  // Safety checks
  const safeToDelete = [];
  const blockedConflicts = [];

  for (const asset of unusedAssets) {
    if (asset._count.references > 0) {
      blockedConflicts.push({ asset, reason: 'Has active references' });
      continue;
    }
    if (inUseFileNames.has(asset.fileName)) {
      blockedConflicts.push({ asset, reason: 'Filename matches an in-use asset' });
      continue;
    }
    if (inUseUrls.has(asset.url)) {
      blockedConflicts.push({ asset, reason: 'URL matches an in-use asset' });
      continue;
    }
    if (asset.storagePath && inUsePaths.has(asset.storagePath)) {
      blockedConflicts.push({ asset, reason: 'StoragePath matches an in-use asset' });
      continue;
    }
    safeToDelete.push(asset);
  }

  console.log(`Safe to permanently delete: ${safeToDelete.length}`);
  console.log(`Blocked by conflict safety guards: ${blockedConflicts.length}`);

  if (blockedConflicts.length > 0) {
    console.warn('Blocked conflicts details:', blockedConflicts);
  }

  // Calculate total disk size to be freed
  const totalBytesToFree = safeToDelete.reduce((sum, a) => sum + (a.size || 0), 0);
  console.log(`Total disk storage to be reclaimed: ${(totalBytesToFree / (1024 * 1024)).toFixed(2)} MB`);

  if (DRY_RUN) {
    console.log(`\n🛡️  DRY RUN completed. Run with '--execute' to permanently delete these ${safeToDelete.length} unused assets.`);
    return;
  }

  console.log(`\n🚀 Permanently deleting ${safeToDelete.length} assets...`);

  const uploadsDir = path.join(__dirname, '..', 'multimedia', 'uploads');
  let diskFilesDeleted = 0;
  let diskFilesNotFound = 0;
  const assetIdsToDelete = safeToDelete.map((a) => a.id);

  // 1. Unlink local files on disk
  for (const asset of safeToDelete) {
    const diskPath = path.join(uploadsDir, asset.fileName);
    try {
      if (fs.existsSync(diskPath)) {
        fs.unlinkSync(diskPath);
        diskFilesDeleted++;
      } else {
        diskFilesNotFound++;
      }
    } catch (err) {
      console.warn(`Failed to unlink file ${asset.fileName}:`, err.message);
    }
  }

  console.log(`Disk files unlinked: ${diskFilesDeleted}`);
  console.log(`Disk files already not on disk: ${diskFilesNotFound}`);

  // 2. Delete any related audit logs or deletion jobs
  console.log(`Cleaning related audit logs and deletion jobs...`);
  const deletedAuditLogs = await prisma.mediaAuditLog.deleteMany({
    where: { mediaId: { in: assetIdsToDelete } },
  });
  console.log(`Deleted ${deletedAuditLogs.count} audit log entries.`);

  const deletedJobs = await prisma.mediaDeletionJob.deleteMany({
    where: { mediaId: { in: assetIdsToDelete } },
  });
  console.log(`Deleted ${deletedJobs.count} deletion job entries.`);

  // 3. Delete MediaAsset records in DB
  const deletedAssets = await prisma.mediaAsset.deleteMany({
    where: { id: { in: assetIdsToDelete } },
  });
  console.log(`Deleted ${deletedAssets.count} MediaAsset rows from database.`);

  console.log(`\n======================================================`);
  console.log(`🎉 PERMANENT DELETION COMPLETE!`);
  console.log(`======================================================`);
  console.log(`Total Assets Purged: ${deletedAssets.count}`);
  console.log(`Disk Storage Freed: ${(totalBytesToFree / (1024 * 1024)).toFixed(2)} MB`);
  console.log(`======================================================\n`);
}

main()
  .catch((e) => {
    console.error('Error in permanent delete:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
