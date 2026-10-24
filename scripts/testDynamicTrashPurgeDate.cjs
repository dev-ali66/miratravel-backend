const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function runTest() {
  console.log('====================================================================');
  console.log('🧪 LIVE ACCEPTANCE TEST: DYNAMIC OUTBOX RECALCULATION ON TRASH PURGE');
  console.log('====================================================================\n');

  const {
    calculateNextDueTime,
    getMediaWorkerStatus,
  } = require('../dist/src/workers/mediaWorker.js');
  const {
    softDeleteMedia,
    permanentDeleteMedia,
    restoreMedia,
  } = require('../dist/src/modules/media/media.service.js');

  // STEP 1: Verify Initial Clean State
  console.log('--- STEP 1: Verifying Clean Baseline ---');
  const initialStatus = await getMediaWorkerStatus();
  console.log('Initial Worker Status:', {
    pendingJobsCount: initialStatus.pendingJobsCount,
    nextRunAt: initialStatus.nextRunAt,
  });

  if (initialStatus.pendingJobsCount !== 0 || initialStatus.nextRunAt !== null) {
    throw new Error('❌ Baseline should have 0 pending jobs and null nextRunAt when trash is empty');
  }
  console.log('✅ Baseline verified: 0 pending, nextRunAt = null ("None scheduled")');

  // STEP 2: Create Two Test Assets for Dynamic Scheduling
  console.log('\n--- STEP 2: Creating Test Assets A & B ---');
  const assetA = await prisma.mediaAsset.create({
    data: {
      fileName: 'test-asset-a-dynamic.jpg',
      originalName: 'test-asset-a.jpg',
      storagePath: 'test/path/a.jpg',
      url: 'https://api.miratravel.nl/multimedia/uploads/test-asset-a-dynamic.jpg',
      mimeType: 'image/jpeg',
      size: 1024,
      status: 'ACTIVE',
    },
  });

  const assetB = await prisma.mediaAsset.create({
    data: {
      fileName: 'test-asset-b-dynamic.jpg',
      originalName: 'test-asset-b.jpg',
      storagePath: 'test/path/b.jpg',
      url: 'https://api.miratravel.nl/multimedia/uploads/test-asset-b-dynamic.jpg',
      mimeType: 'image/jpeg',
      size: 2048,
      status: 'ACTIVE',
    },
  });
  console.log(`Created Asset A (${assetA.id}) and Asset B (${assetB.id})`);

  // STEP 3: Move Asset A to Trash (Scheduled for +30 days)
  console.log('\n--- STEP 3: Soft-Deleting Asset A (Scheduled for +30 days) ---');
  const dateA = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  await prisma.mediaAsset.update({
    where: { id: assetA.id },
    data: { status: 'IN_TRASH', deletedAt: new Date() },
  });
  await prisma.mediaDeletionJob.create({
    data: {
      mediaId: assetA.id,
      filePath: assetA.storagePath,
      scheduledFor: dateA,
      status: 'PENDING',
    },
  });

  const statusAfterA = await getMediaWorkerStatus();
  console.log('Status after trashing Asset A:', {
    pendingJobsCount: statusAfterA.pendingJobsCount,
    nextRunAt: statusAfterA.nextRunAt?.toISOString(),
  });

  if (statusAfterA.pendingJobsCount !== 1 || !statusAfterA.nextRunAt) {
    throw new Error('❌ Expected 1 pending job with nextRunAt matching Asset A');
  }
  console.log('✅ Next automated purge correctly set to Asset A due date');

  // STEP 4: Move Asset B to Trash with EARLIER date (+5 days)
  console.log('\n--- STEP 4: Soft-Deleting Asset B with Earlier Date (+5 days) ---');
  const dateB = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000);
  await prisma.mediaAsset.update({
    where: { id: assetB.id },
    data: { status: 'IN_TRASH', deletedAt: new Date() },
  });
  await prisma.mediaDeletionJob.create({
    data: {
      mediaId: assetB.id,
      filePath: assetB.storagePath,
      scheduledFor: dateB,
      status: 'PENDING',
    },
  });

  const statusAfterB = await getMediaWorkerStatus();
  console.log('Status after trashing Asset B (earlier date):', {
    pendingJobsCount: statusAfterB.pendingJobsCount,
    nextRunAt: statusAfterB.nextRunAt?.toISOString(),
  });

  if (statusAfterB.pendingJobsCount !== 2 || statusAfterB.nextRunAt?.toISOString() !== dateB.toISOString()) {
    throw new Error('❌ Next automated purge should have dynamically shifted to Asset B (earliest date)');
  }
  console.log('✅ Next automated purge dynamically shifted to Asset B (earliest)');

  // STEP 5: User Manually Deletes Asset B (The exact scenario described by user in audio)
  console.log('\n--- STEP 5: Manually Permanently Deleting Asset B (Nearest Item Cleared) ---');
  await permanentDeleteMedia(assetB.id);

  const statusAfterDeletingB = await getMediaWorkerStatus();
  console.log('Status after manually deleting Asset B:', {
    pendingJobsCount: statusAfterDeletingB.pendingJobsCount,
    nextRunAt: statusAfterDeletingB.nextRunAt?.toISOString(),
  });

  if (
    statusAfterDeletingB.pendingJobsCount !== 1 ||
    statusAfterDeletingB.nextRunAt?.toISOString() !== dateA.toISOString()
  ) {
    throw new Error('❌ Next automated purge should have immediately recalculated back to Asset A date!');
  }
  console.log('✅ Next automated purge immediately shifted to Asset A due date (Asset B job removed)');

  // STEP 6: Restore Asset A back to ACTIVE
  console.log('\n--- STEP 6: Restoring Asset A back to ACTIVE (Trash becomes completely empty) ---');
  await restoreMedia(assetA.id);

  const statusAfterRestoringA = await getMediaWorkerStatus();
  console.log('Status after restoring Asset A:', {
    pendingJobsCount: statusAfterRestoringA.pendingJobsCount,
    nextRunAt: statusAfterRestoringA.nextRunAt,
  });

  if (statusAfterRestoringA.pendingJobsCount !== 0 || statusAfterRestoringA.nextRunAt !== null) {
    throw new Error('❌ Trash is empty, so pendingJobsCount must be 0 and nextRunAt must be null ("None scheduled")!');
  }
  console.log('✅ Next automated purge reset to null ("None scheduled") because trash is clean');

  // CLEANUP: delete test asset A
  await prisma.mediaAsset.delete({ where: { id: assetA.id } });

  console.log('\n====================================================================');
  console.log('🎉 ALL DYNAMIC RECALCULATION TESTS PASSED (100% SUCCESS)');
  console.log('====================================================================');

  await prisma.$disconnect();
}

runTest().catch(async (err) => {
  console.error('\n❌ TEST FAILED:', err);
  await prisma.$disconnect();
  process.exit(1);
});
