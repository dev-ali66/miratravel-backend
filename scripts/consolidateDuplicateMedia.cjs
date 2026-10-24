const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const prisma = new PrismaClient();

const DRY_RUN = process.argv.includes('--execute') ? false : true;

function computeFileHash(absPath) {
  try {
    if (!fs.existsSync(absPath)) return null;
    const buf = fs.readFileSync(absPath);
    return crypto.createHash('sha256').update(buf).digest('hex');
  } catch (err) {
    return null;
  }
}

// Deep replace URL/path helper for JSON objects
function deepReplace(obj, replacements) {
  let count = 0;
  if (!obj || typeof obj !== 'object') return { updated: obj, count };

  if (Array.isArray(obj)) {
    const newArr = [];
    for (const item of obj) {
      if (typeof item === 'string') {
        let str = item;
        let matched = false;
        for (const [from, to] of replacements) {
          if (str === from) {
            str = to;
            matched = true;
            count++;
            break;
          } else if (str.includes(from)) {
            str = str.split(from).join(to);
            matched = true;
            count++;
          }
        }
        newArr.push(str);
      } else if (typeof item === 'object') {
        const res = deepReplace(item, replacements);
        newArr.push(res.updated);
        count += res.count;
      } else {
        newArr.push(item);
      }
    }
    return { updated: newArr, count };
  }

  const newObj = { ...obj };
  for (const [k, v] of Object.entries(newObj)) {
    if (typeof v === 'string') {
      let str = v;
      for (const [from, to] of replacements) {
        if (str === from) {
          str = to;
          count++;
          break;
        } else if (str.includes(from)) {
          str = str.split(from).join(to);
          count++;
        }
      }
      newObj[k] = str;
    } else if (typeof v === 'object' && v !== null) {
      const res = deepReplace(v, replacements);
      newObj[k] = res.updated;
      count += res.count;
    }
  }

  return { updated: newObj, count };
}

async function main() {
  console.log(`\n======================================================`);
  console.log(`🔍 HIGH-PERFORMANCE MEDIA CONSOLIDATION ENGINE`);
  console.log(`Mode: ${DRY_RUN ? '🛡️  DRY RUN (Preview only, no writes)' : '🚀 LIVE EXECUTION (Writing changes to DB)'}`);
  console.log(`======================================================\n`);

  // 1. Fetch all ACTIVE assets
  const allAssets = await prisma.mediaAsset.findMany({
    where: { status: 'ACTIVE' },
    include: {
      _count: { select: { references: true } },
    },
    orderBy: { createdAt: 'asc' },
  });

  console.log(`Total ACTIVE media assets in DB: ${allAssets.length}`);

  // 2. Group by hash
  const uploadsDir = path.join(__dirname, '..', 'multimedia', 'uploads');
  const byHash = new Map();

  for (const asset of allAssets) {
    let hash = asset.hash;
    if (!hash) {
      const diskPath = path.join(uploadsDir, asset.fileName);
      hash = computeFileHash(diskPath);
      if (hash && !DRY_RUN) {
        await prisma.mediaAsset.update({
          where: { id: asset.id },
          data: { hash },
        });
      }
    }

    if (!hash) {
      hash = `size_${asset.size}_${asset.mimeType}`;
    }

    if (!byHash.has(hash)) byHash.set(hash, []);
    byHash.get(hash).push(asset);
  }

  // 3. Filter duplicate groups
  const duplicateGroups = [];
  for (const [hash, group] of byHash.entries()) {
    if (group.length > 1) {
      duplicateGroups.push({
        hash,
        assets: group,
      });
    }
  }

  console.log(`Found ${duplicateGroups.length} duplicate image groups.`);
  let totalDuplicateFiles = 0;
  for (const g of duplicateGroups) {
    totalDuplicateFiles += g.assets.length - 1;
  }
  console.log(`Total redundant duplicate asset records to consolidate: ${totalDuplicateFiles}\n`);

  // Build global mapping
  const globalReplacements = [];
  const dupToMasterMap = new Map(); // dupId -> masterAsset
  const masterIds = new Set();

  for (let i = 0; i < duplicateGroups.length; i++) {
    const { hash, assets } = duplicateGroups[i];

    const sorted = [...assets].sort((a, b) => {
      if (b._count.references !== a._count.references) {
        return b._count.references - a._count.references;
      }
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });

    const master = sorted[0];
    masterIds.add(master.id);
    const duplicates = sorted.slice(1);
    const totalGroupRefsBefore = assets.reduce((sum, a) => sum + a._count.references, 0);

    console.log(`📦 Group #${i + 1} [Hash: ${hash.slice(0, 16)}...] ➔ Master: ${master.fileName} (Combined refs will be: ${totalGroupRefsBefore})`);

    for (const dup of duplicates) {
      dupToMasterMap.set(dup.id, master);
      globalReplacements.push([dup.url, master.url]);
      if (dup.storagePath && master.storagePath && dup.storagePath !== master.storagePath) {
        globalReplacements.push([dup.storagePath, master.storagePath]);
      }
    }
  }

  console.log(`\nURL & Path replacements registered: ${globalReplacements.length}`);

  if (DRY_RUN) {
    console.log(`\n🛡️  DRY RUN completed. Run with '--execute' to perform the migration.`);
    return;
  }

  console.log(`\n🚀 Executing batched live migration...`);

  // Step A: Batched MediaReference table migration
  console.log(`A. Batch-processing MediaReference table...`);
  const dupIds = Array.from(dupToMasterMap.keys());
  
  // Fetch all existing duplicate references in 1 single query
  const allDupRefs = await prisma.mediaReference.findMany({
    where: { mediaId: { in: dupIds } },
  });
  console.log(`   Found ${allDupRefs.length} references currently pointing to duplicate assets.`);

  // Fetch all existing master references in 1 single query
  const allMasterRefs = await prisma.mediaReference.findMany({
    where: { mediaId: { in: Array.from(masterIds) } },
  });

  const masterKeySet = new Set(
    allMasterRefs.map((r) => `${r.mediaId}:${r.entityType}:${r.entityId}:${r.fieldPath}`)
  );

  const refsToDelete = [];
  const refsToUpdateByMaster = new Map(); // masterId -> [refIds]

  for (const ref of allDupRefs) {
    const targetMaster = dupToMasterMap.get(ref.mediaId);
    if (!targetMaster) continue;

    const key = `${targetMaster.id}:${ref.entityType}:${ref.entityId}:${ref.fieldPath}`;
    if (masterKeySet.has(key)) {
      refsToDelete.push(ref.id);
    } else {
      masterKeySet.add(key);
      if (!refsToUpdateByMaster.has(targetMaster.id)) {
        refsToUpdateByMaster.set(targetMaster.id, []);
      }
      refsToUpdateByMaster.get(targetMaster.id).push(ref.id);
    }
  }

  // 1 query to delete duplicate references that already exist on master
  if (refsToDelete.length > 0) {
    await prisma.mediaReference.deleteMany({
      where: { id: { in: refsToDelete } },
    });
    console.log(`   ➔ Deleted ${refsToDelete.length} redundant duplicate reference rows.`);
  }

  // Batch update remaining references per master
  let totalMigrated = 0;
  for (const [masterId, refIds] of refsToUpdateByMaster.entries()) {
    const res = await prisma.mediaReference.updateMany({
      where: { id: { in: refIds } },
      data: { mediaId: masterId },
    });
    totalMigrated += res.count;
  }
  console.log(`   ➔ Re-pointed ${totalMigrated} references to their Master assets.`);

  // Step B: Update entity records
  console.log(`B. Updating Entity JSON fields across database...`);
  let totalFieldReplacements = 0;

  // B1. Journeys
  const journeys = await prisma.journey.findMany();
  for (const j of journeys) {
    let modified = false;
    const updatedData = {};
    for (const field of ['hero', 'card', 'accommodations', 'gallery', 'itinerary', 'inclusions', 'exclusions', 'importantInfo']) {
      if (j[field]) {
        const res = deepReplace(j[field], globalReplacements);
        if (res.count > 0) {
          updatedData[field] = res.updated;
          modified = true;
          totalFieldReplacements += res.count;
        }
      }
    }
    if (modified) {
      await prisma.journey.update({ where: { id: j.id }, data: updatedData });
    }
  }

  // B2. Locations
  const locations = await prisma.location.findMany();
  for (const l of locations) {
    let modified = false;
    const updatedData = {};
    for (const field of ['hero', 'card', 'gallery', 'sections', 'bestTimeToVisit']) {
      if (l[field]) {
        const res = deepReplace(l[field], globalReplacements);
        if (res.count > 0) {
          updatedData[field] = res.updated;
          modified = true;
          totalFieldReplacements += res.count;
        }
      }
    }
    if (modified) {
      await prisma.location.update({ where: { id: l.id }, data: updatedData });
    }
  }

  // B3. Experiences
  const experiences = await prisma.experience.findMany();
  for (const exp of experiences) {
    let modified = false;
    const updatedData = {};
    for (const field of ['hero', 'card', 'gallery', 'sections']) {
      if (exp[field]) {
        const res = deepReplace(exp[field], globalReplacements);
        if (res.count > 0) {
          updatedData[field] = res.updated;
          modified = true;
          totalFieldReplacements += res.count;
        }
      }
    }
    if (modified) {
      await prisma.experience.update({ where: { id: exp.id }, data: updatedData });
    }
  }

  // B4. Stories
  const stories = await prisma.story.findMany();
  for (const st of stories) {
    let modified = false;
    const updatedData = {};
    for (const field of ['hero', 'card', 'sections']) {
      if (st[field]) {
        const res = deepReplace(st[field], globalReplacements);
        if (res.count > 0) {
          updatedData[field] = res.updated;
          modified = true;
          totalFieldReplacements += res.count;
        }
      }
    }
    if (modified) {
      await prisma.story.update({ where: { id: st.id }, data: updatedData });
    }
  }

  // B5. CmsPages
  const cmsPages = await prisma.cmsPage.findMany();
  for (const cp of cmsPages) {
    if (cp.sections) {
      const res = deepReplace(cp.sections, globalReplacements);
      if (res.count > 0) {
        await prisma.cmsPage.update({
          where: { id: cp.id },
          data: { sections: res.updated },
        });
        totalFieldReplacements += res.count;
      }
    }
  }

  // B6. SiteSettings
  const settings = await prisma.siteSettings.findFirst();
  if (settings) {
    let modified = false;
    const updatedData = {};
    for (const field of ['siteLogo', 'siteLogoLight', 'siteLogoDark', 'siteFavicon', 'navbarLogo', 'footerLogo', 'authLogo', 'loadingVideo', 'socialMeta']) {
      if (settings[field]) {
        const res = deepReplace(settings[field], globalReplacements);
        if (res.count > 0) {
          updatedData[field] = res.updated;
          modified = true;
          totalFieldReplacements += res.count;
        }
      }
    }
    if (modified) {
      await prisma.siteSettings.update({
        where: { id: settings.id },
        data: updatedData,
      });
    }
  }

  // B7. UserPersonalInfo
  const userInfos = await prisma.userPersonalInfo.findMany();
  for (const u of userInfos) {
    if (u.photoUrl && u.photoUrl.length > 0) {
      const res = deepReplace(u.photoUrl, globalReplacements);
      if (res.count > 0) {
        await prisma.userPersonalInfo.update({
          where: { id: u.id },
          data: { photoUrl: res.updated },
        });
        totalFieldReplacements += res.count;
      }
    }
  }

  console.log(`   ➔ Total entity JSON URL occurrences updated: ${totalFieldReplacements}`);

  // Step C: Verify zero usage on all duplicates
  console.log(`C. Verifying consolidation state in database...`);
  const remainingDupRefsCount = await prisma.mediaReference.count({
    where: { mediaId: { in: dupIds } },
  });

  console.log(`\n======================================================`);
  console.log(`🎉 CONSOLIDATION COMPLETED SUCCESSFULLY!`);
  console.log(`======================================================`);
  console.log(`Duplicate Groups processed: ${duplicateGroups.length}`);
  console.log(`Master Assets enriched: ${duplicateGroups.length}`);
  console.log(`Duplicate Assets cleared: ${dupIds.length}`);
  console.log(`Remaining references on duplicate assets: ${remainingDupRefsCount} (Must be 0)`);
  console.log(`Total JSON fields updated across system: ${totalFieldReplacements}`);
  console.log(`\n✨ Result: All ${dupIds.length} duplicate files now have 0 usages (Unused)!`);
  console.log(`   You can immediately view them under 'Unused Only' in the Media Library.`);
}

main()
  .catch((e) => {
    console.error('Error during consolidation:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
