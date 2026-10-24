const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function inspect() {
  const { calculateNextDueTime, getMediaWorkerStatus } = require('../dist/src/workers/mediaWorker.js');

  console.log('--- Testing calculateNextDueTime() with Auto-Reconcile ---');
  const due = await calculateNextDueTime();
  console.log('Result from calculateNextDueTime():', due);

  const status = await getMediaWorkerStatus();
  console.log('Worker Status:', status);

  const trashedCount = await prisma.mediaAsset.count({ where: { status: 'IN_TRASH' } });
  const pendingJobs = await prisma.mediaDeletionJob.findMany({
    where: { status: 'PENDING' },
    orderBy: { scheduledFor: 'asc' },
  });

  console.log(`Current assets with status: 'IN_TRASH' in DB: ${trashedCount}`);
  console.log(`Pending deletion jobs remaining in DB: ${pendingJobs.length}`);

  await prisma.$disconnect();
}

inspect().catch(err => {
  console.error(err);
  prisma.$disconnect();
});
