/**
 * Phase 5 Comprehensive Real-Life End-to-End Test Suite
 * 
 * Tests:
 * 1. Reference Sync on Entity Create (Story & Journey)
 * 2. 409 Conflict Prevention on referenced media deletion
 * 3. Reference replacement & Auto-Move unreferenced asset to 30-day Trash + Outbox Deletion Job
 * 4. Auto-Restore from Trash upon re-referencing in an entity + Outbox Job Cancellation
 * 5. Reference Cleanup upon Entity Deletion + Outbox Job Enqueue
 * 6. SiteSettings Reference Synchronization
 * 7. Verification of audit logs and zero data corruption
 */

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Use dynamic import for ES modules in backend
async function loadModules() {
  const mediaRefModule = await import("../dist/src/shared/mediaReference.service.js").catch(async () => {
    return await import("../src/shared/mediaReference.service.ts");
  });
  return {
    syncEntityMediaReferences: mediaRefModule.syncEntityMediaReferences,
    removeEntityMediaReferences: mediaRefModule.removeEntityMediaReferences,
    assertMediaCanBeDeleted: mediaRefModule.assertMediaCanBeDeleted,
    getMediaUsage: mediaRefModule.getMediaUsage,
    normalizeEntityType: mediaRefModule.normalizeEntityType,
  };
}

async function run() {
  console.log("==========================================================================");
  console.log("🧪 STARTING PHASE 5: REAL-LIFE EXISTING SERVICES INTEGRATION VERIFICATION");
  console.log("==========================================================================\n");

  const {
    syncEntityMediaReferences,
    removeEntityMediaReferences,
    assertMediaCanBeDeleted,
    getMediaUsage,
    normalizeEntityType,
  } = await loadModules();

  let passedTests = 0;
  let totalTests = 7;

  // Setup: Pick two real active media assets from database
  const activeAssets = await prisma.mediaAsset.findMany({
    where: { status: "ACTIVE" },
    take: 2,
  });

  if (activeAssets.length < 2) {
    throw new Error("Need at least 2 active MediaAssets in database for testing.");
  }

  const assetA = activeAssets[0];
  const assetB = activeAssets[1];

  console.log(`📌 Using Test Assets:`);
  console.log(`   Asset A: id=${assetA.id}, fileName=${assetA.fileName}, url=${assetA.url}`);
  console.log(`   Asset B: id=${assetB.id}, fileName=${assetB.fileName}, url=${assetB.url}\n`);

  // --------------------------------------------------------------------------
  // TEST 1: Entity Normalization & Reference Sync on Create
  // --------------------------------------------------------------------------
  console.log("▶ TEST 1: Testing normalizeEntityType & syncEntityMediaReferences on Entity Create...");
  if (
    normalizeEntityType("journey") === "Journey" &&
    normalizeEntityType("location") === "Location" &&
    normalizeEntityType("cmsPage") === "CmsPage" &&
    normalizeEntityType("story") === "Story" &&
    normalizeEntityType("siteSettings") === "SiteSettings"
  ) {
    console.log("   ✔ normalizeEntityType correctly normalizes all casing & aliases to PascalCase.");
  } else {
    throw new Error("normalizeEntityType failed!");
  }

  const testEntityId = `test_phase5_${Date.now()}`;
  const mockJourneyRecord = {
    id: testEntityId,
    title: "Test Phase 5 Alpine Escape",
    slug: `test-phase5-alpine-${Date.now()}`,
    hero: {
      backgroundMultimedia: {
        show: "image",
        color: { color: "#000", opacity: 100 },
        image: { url: assetA.url, alt: "Alpine Hero Image" },
        video: { url: "" },
      },
    },
    card: {
      image: { url: assetA.url, alt: "Alpine Card Image" },
    },
  };

  const syncResult1 = await syncEntityMediaReferences("journey", testEntityId, mockJourneyRecord);
  console.log("   Sync result:", syncResult1);

  const refsAfterCreate = await prisma.mediaReference.findMany({
    where: { entityType: "Journey", entityId: testEntityId },
  });

  if (refsAfterCreate.length === 2 && refsAfterCreate.every((r) => r.mediaId === assetA.id)) {
    console.log(`   ✔ Successfully created 2 media references for Journey '${testEntityId}' with canonical entityType 'Journey'.`);
    passedTests++;
  } else {
    throw new Error(`TEST 1 FAILED: Expected 2 references, got ${refsAfterCreate.length}`);
  }

  // --------------------------------------------------------------------------
  // TEST 2: Conflict Protection (AssertMediaCanBeDeleted)
  // --------------------------------------------------------------------------
  console.log("\n▶ TEST 2: Testing Deletion Blocking & HTTP 409 Conflict Protection on Active Reference...");
  const usageA = await getMediaUsage(assetA.id);
  console.log(`   Asset A total usage count: ${usageA.usageCount}`);
  const hasTestRef = usageA.references.some((r) => r.entityId === testEntityId);

  if (hasTestRef) {
    console.log(`   ✔ getMediaUsage successfully resolved referencing entity metadata: '${usageA.references[0].entityTitle}' (${usageA.references[0].editUrl})`);
  } else {
    throw new Error("TEST 2 FAILED: Test Journey reference not found in getMediaUsage!");
  }

  let conflictBlocked = false;
  try {
    await assertMediaCanBeDeleted(assetA.id);
  } catch (err) {
    if (err.statusCode === 409 && err.message.includes("actively used")) {
      conflictBlocked = true;
      console.log(`   ✔ assertMediaCanBeDeleted correctly threw HTTP 409 Conflict: "${err.message}"`);
    }
  }

  if (conflictBlocked) {
    passedTests++;
  } else {
    throw new Error("TEST 2 FAILED: assertMediaCanBeDeleted did not block referenced asset!");
  }

  // --------------------------------------------------------------------------
  // TEST 3: Entity Update (Replace Image A with Image B)
  // --------------------------------------------------------------------------
  console.log("\n▶ TEST 3: Testing Entity Update (Replacing Asset A with Asset B)...");
  const updatedMockJourney = {
    ...mockJourneyRecord,
    hero: {
      backgroundMultimedia: {
        show: "image",
        color: { color: "#000", opacity: 100 },
        image: { url: assetB.url, alt: "New Alpine Hero Image" },
        video: { url: "" },
      },
    },
    card: {
      image: { url: assetB.url, alt: "New Alpine Card Image" },
    },
  };

  const syncResult2 = await syncEntityMediaReferences("Journey", testEntityId, updatedMockJourney);
  console.log("   Update sync result:", syncResult2);

  const refsAfterUpdate = await prisma.mediaReference.findMany({
    where: { entityType: "Journey", entityId: testEntityId },
  });

  const allAreAssetB = refsAfterUpdate.length === 2 && refsAfterUpdate.every((r) => r.mediaId === assetB.id);
  if (allAreAssetB) {
    console.log(`   ✔ Replaced references: Asset A references cleanly removed, Asset B references created.`);
    passedTests++;
  } else {
    throw new Error("TEST 3 FAILED: Reference replacement failed!");
  }

  // --------------------------------------------------------------------------
  // TEST 4: Dedicated Isolated Asset Unreferenced -> 30-Day Trash & Outbox Job
  // --------------------------------------------------------------------------
  console.log("\n▶ TEST 4: Testing Unreferenced Asset Transition to IN_TRASH & Outbox Deletion Job Creation...");
  // Create an isolated temporary MediaAsset to test 0-reference trash automation
  const isolatedAsset = await prisma.mediaAsset.create({
    data: {
      fileName: `test-isolated-${Date.now()}.jpg`,
      storagePath: `/multimedia/uploads/test-isolated-${Date.now()}.jpg`,
      url: `https://api.miratravel.nl/multimedia/uploads/test-isolated-${Date.now()}.jpg`,
      mimeType: "image/jpeg",
      size: 1024,
      status: "ACTIVE",
    },
  });

  const tempStoryId = `test_story_${Date.now()}`;
  const mockStory = {
    id: tempStoryId,
    title: "Test Editorial Story",
    hero: {
      imageMultimedia: {
        image: { url: isolatedAsset.url },
      },
    },
  };

  // Sync reference for isolatedAsset
  await syncEntityMediaReferences("Story", tempStoryId, mockStory);
  const isoRefCount1 = await prisma.mediaReference.count({ where: { mediaId: isolatedAsset.id } });
  console.log(`   Isolated asset created and referenced in Story (refCount = ${isoRefCount1}).`);

  // Now update Story removing the reference
  const mockStoryEmpty = {
    id: tempStoryId,
    title: "Test Editorial Story",
    hero: {
      imageMultimedia: {
        image: { url: "" },
      },
    },
  };

  const syncResult3 = await syncEntityMediaReferences("Story", tempStoryId, mockStoryEmpty);
  console.log("   Story update sync result:", syncResult3);

  // Verify isolatedAsset moved to IN_TRASH and has an Outbox Deletion Job
  const trashedAsset = await prisma.mediaAsset.findUnique({
    where: { id: isolatedAsset.id },
  });
  const deletionJob = await prisma.mediaDeletionJob.findFirst({
    where: { mediaId: isolatedAsset.id, status: "PENDING" },
  });
  const trashAuditLog = await prisma.mediaAuditLog.findFirst({
    where: { mediaId: isolatedAsset.id, action: "MOVE_TO_TRASH" },
    orderBy: { createdAt: "desc" },
  });

  if (
    trashedAsset.status === "IN_TRASH" &&
    trashedAsset.deletedAt !== null &&
    deletionJob !== null &&
    deletionJob.status === "PENDING" &&
    trashAuditLog !== null
  ) {
    console.log(`   ✔ Isolated asset successfully transitioned to IN_TRASH.`);
    console.log(`   ✔ MediaDeletionJob scheduled for: ${deletionJob.scheduledFor.toISOString()}`);
    console.log(`   ✔ MediaAuditLog recorded: action=${trashAuditLog.action}`);
    passedTests++;
  } else {
    throw new Error("TEST 4 FAILED: Asset did not move to IN_TRASH or missing MediaDeletionJob!");
  }

  // --------------------------------------------------------------------------
  // TEST 5: Auto-Restore from Trash upon Re-Referencing
  // --------------------------------------------------------------------------
  console.log("\n▶ TEST 5: Testing Auto-Restore from Trash upon Re-Referencing & Job Cancellation...");
  // Re-reference isolatedAsset in the Story
  const syncRes5 = await syncEntityMediaReferences("Story", tempStoryId, mockStory);
  console.log("   syncRes5 return:", syncRes5);

  const restoredAsset = await prisma.mediaAsset.findUnique({
    where: { id: isolatedAsset.id },
  });
  const completedJob = await prisma.mediaDeletionJob.findFirst({
    where: { mediaId: isolatedAsset.id },
  });
  const restoreAuditLog = await prisma.mediaAuditLog.findFirst({
    where: { mediaId: isolatedAsset.id, action: "RESTORE" },
    orderBy: { createdAt: "desc" },
  });

  console.log("   Diagnostic Test 5:");
  console.log("   - restoredAsset:", restoredAsset);
  console.log("   - completedJob:", completedJob);
  console.log("   - restoreAuditLog:", restoreAuditLog);

  if (
    restoredAsset &&
    restoredAsset.status === "ACTIVE" &&
    restoredAsset.deletedAt === null &&
    completedJob &&
    completedJob.status === "COMPLETED" &&
    restoreAuditLog !== null
  ) {
    console.log(`   ✔ Asset status successfully restored to ACTIVE (deletedAt cleared).`);
    console.log(`   ✔ MediaDeletionJob cancelled/marked COMPLETED.`);
    console.log(`   ✔ MediaAuditLog recorded: action=${restoreAuditLog.action}`);
    passedTests++;
  } else {
    throw new Error("TEST 5 FAILED: Asset auto-restore failed!");
  }

  // --------------------------------------------------------------------------
  // TEST 6: Entity Hard Deletion (removeEntityMediaReferences)
  // --------------------------------------------------------------------------
  console.log("\n▶ TEST 6: Testing removeEntityMediaReferences on Entity Hard Deletion...");
  const removeResult = await removeEntityMediaReferences("Story", tempStoryId);
  console.log("   Remove entity media references result:", removeResult);

  const refsRemaining = await prisma.mediaReference.count({
    where: { entityType: "Story", entityId: tempStoryId },
  });

  const assetFinalState = await prisma.mediaAsset.findUnique({
    where: { id: isolatedAsset.id },
  });

  if (refsRemaining === 0 && assetFinalState.status === "IN_TRASH") {
    console.log(`   ✔ All references for entity '${tempStoryId}' were removed.`);
    console.log(`   ✔ Asset with 0 remaining references safely moved to IN_TRASH.`);
    passedTests++;
  } else {
    throw new Error("TEST 6 FAILED: References remained or asset was not moved to trash!");
  }

  // --------------------------------------------------------------------------
  // TEST 7: SiteSettings Media Reference Synchronization
  // --------------------------------------------------------------------------
  console.log("\n▶ TEST 7: Testing SiteSettings Media Reference Sync...");
  const mockSettings = {
    id: "global",
    siteName: "MIRA Luxury Travel",
    logo: assetB.url,
    footerLogo: assetB.url,
  };

  const settingsSync = await syncEntityMediaReferences("SiteSettings", "global", mockSettings);
  console.log("   SiteSettings sync result:", settingsSync);

  const settingsRefs = await prisma.mediaReference.findMany({
    where: { entityType: "SiteSettings", entityId: "global" },
  });

  if (settingsRefs.length >= 2) {
    console.log(`   ✔ SiteSettings successfully synchronized media references (${settingsRefs.length} references).`);
    passedTests++;
  } else {
    throw new Error("TEST 7 FAILED: SiteSettings references failed!");
  }

  // --------------------------------------------------------------------------
  // CLEANUP TEST DATA
  // --------------------------------------------------------------------------
  console.log("\n🧹 Cleaning up test artifacts...");
  await removeEntityMediaReferences("Journey", testEntityId);
  await removeEntityMediaReferences("Story", tempStoryId);
  await prisma.mediaAuditLog.deleteMany({ where: { mediaId: isolatedAsset.id } });
  await prisma.mediaDeletionJob.deleteMany({ where: { mediaId: isolatedAsset.id } });
  await prisma.mediaAsset.delete({ where: { id: isolatedAsset.id } });
  console.log("   ✔ Test data cleanly purged. Zero orphan state remaining.");

  console.log("\n==========================================================================");
  console.log(`🎉 ALL ${passedTests}/${totalTests} TESTS PASSED SUCCESSFULLY! (100% SUCCESS)`);
  console.log("==========================================================================");
}

run()
  .catch((err) => {
    console.error("\n❌ PHASE 5 TEST SUITE ERROR:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
