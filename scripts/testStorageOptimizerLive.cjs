const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function runTest() {
  console.log('================================================================');
  console.log('🧪 LIVE ACCEPTANCE TEST: UNIVERSAL STORAGE OPTIMIZER (PHASE 10)');
  console.log('================================================================\n');

  const {
    scanStorageOptimization,
    getMediaStats,
  } = require('../dist/src/modules/media/media.service.js');

  // STEP 1: Verify Audit Logs for Storage Optimization
  console.log('--- STEP 1: Inspecting Optimization Audit Logs ---');
  const trashedLogs = await prisma.mediaAuditLog.findMany({
    where: { action: 'STORAGE_OPTIMIZE_TRASHED' },
    include: { media: true },
  });
  console.log(`Found ${trashedLogs.length} assets logged as STORAGE_OPTIMIZE_TRASHED.`);

  const masterLogs = await prisma.mediaAuditLog.findMany({
    where: { action: 'STORAGE_OPTIMIZE_MASTER' },
    include: { media: true },
  });
  console.log(`Found ${masterLogs.length} master consolidation logs.`);

  for (const mLog of masterLogs) {
    console.log(`  ⭐ Master: [${mLog.media.fileName}] -> Details:`, mLog.details);
  }

  // STEP 2: Verify Duplicate Assets Sent to 30-Day Trash Bin (User's explicit mandate)
  console.log('\n--- STEP 2: Verifying Duplicate Assets in Trash Bin ---');
  const trashedMediaIds = trashedLogs.map((l) => l.mediaId);
  const trashedAssets = await prisma.mediaAsset.findMany({
    where: { id: { in: trashedMediaIds } },
  });

  const allInTrash = trashedAssets.every(
    (a) => a.status === 'IN_TRASH' && a.deletedAt !== null
  );
  console.log(`Verified ${trashedAssets.length} assets in DB. All in IN_TRASH with deletedAt: ${allInTrash}`);
  if (!allInTrash || trashedAssets.length === 0) {
    throw new Error('❌ Trashed assets verification failed!');
  }

  // STEP 3: Verify Automated 30-Day Deletion Jobs
  console.log('\n--- STEP 3: Verifying Scheduled 30-Day Deletion Jobs ---');
  const deletionJobs = await prisma.mediaDeletionJob.findMany({
    where: {
      mediaId: { in: trashedMediaIds },
      status: 'PENDING',
    },
  });
  const allHaveJobs = trashedMediaIds.every((id) =>
    deletionJobs.some((j) => j.mediaId === id)
  );
  console.log(`Verified Scheduled 30-Day Deletion Jobs: ${deletionJobs.length} total. Every trashed asset covered: ${allHaveJobs}`);
  if (!allHaveJobs) {
    throw new Error(`❌ Not all trashed assets have scheduled deletion jobs!`);
  }

  // STEP 4: Verify Relational Integrity (Zero broken references)
  console.log('\n--- STEP 4: Verifying Whole-Database Relational Integrity ---');
  const brokenReferences = await prisma.mediaReference.count({
    where: {
      media: {
        status: { not: 'ACTIVE' },
      },
    },
  });
  console.log(`Broken / Orphaned References to non-active media: ${brokenReferences}`);
  if (brokenReferences > 0) {
    throw new Error(`❌ Found ${brokenReferences} broken references pointing to non-active media!`);
  }

  // STEP 5: Verify Post-Optimization Scan Result (0 Duplicates)
  console.log('\n--- STEP 5: Running Post-Optimization Scan Verification ---');
  const postScan = await scanStorageOptimization();
  console.log('Post-Optimization Scan Results:', {
    totalDuplicateGroups: postScan.totalDuplicateGroups,
    totalDuplicateAssets: postScan.totalDuplicateAssets,
    reclaimableFormatted: postScan.reclaimableFormatted,
  });

  if (postScan.totalDuplicateGroups !== 0) {
    throw new Error(`❌ Expected 0 duplicate groups post-optimization, but found ${postScan.totalDuplicateGroups}`);
  }

  // STEP 6: Verify Media Stats KPI
  console.log('\n--- STEP 6: Verifying Media Stats KPI Update ---');
  const stats = await getMediaStats();
  console.log('Current Media Stats:', {
    totalCount: stats.totalCount,
    trashCount: stats.trashCount,
    totalSizeFormatted: stats.totalSizeFormatted,
  });

  console.log('\n================================================================');
  console.log('🎉 ALL ACCEPTANCE CRITERIA VERIFIED (100% SUCCESS)');
  console.log('================================================================');

  await prisma.$disconnect();
}

runTest().catch(async (err) => {
  console.error('\n❌ TEST FAILED:', err);
  await prisma.$disconnect();
  process.exit(1);
});
