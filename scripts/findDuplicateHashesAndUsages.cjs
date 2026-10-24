const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function getEntityTitle(entityType, entityId) {
  try {
    switch (entityType.toUpperCase()) {
      case 'JOURNEY': {
        const j = await prisma.journey.findUnique({
          where: { id: entityId },
          select: { title: true },
        });
        return j ? `Journey: "${j.title}"` : `Journey (ID: ${entityId})`;
      }
      case 'LOCATION': {
        const l = await prisma.location.findUnique({
          where: { id: entityId },
          select: { name: true, type: true },
        });
        return l ? `Location: "${l.name}" [${l.type}]` : `Location (ID: ${entityId})`;
      }
      case 'STORY': {
        const s = await prisma.story.findUnique({
          where: { id: entityId },
          select: { title: true },
        });
        return s ? `Story: "${s.title}"` : `Story (ID: ${entityId})`;
      }
      case 'EXPERIENCE': {
        const e = await prisma.experience.findUnique({
          where: { id: entityId },
          select: { name: true },
        });
        return e ? `Experience: "${e.name}"` : `Experience (ID: ${entityId})`;
      }
      case 'SITESETTINGS': {
        const set = await prisma.siteSettings.findUnique({
          where: { id: entityId },
          select: { siteName: true },
        });
        return set ? `SiteSettings: "${set.siteName || 'Global'}"` : `SiteSettings (ID: ${entityId})`;
      }
      default:
        return `${entityType}: ${entityId}`;
    }
  } catch (err) {
    return `${entityType}: ${entityId}`;
  }
}

async function main() {
  console.log('=== MULTIMEDIA EXACT SAME HASH & USAGE ANALYSIS ===\n');

  // 1. Group by hash
  const duplicateGroups = await prisma.mediaAsset.groupBy({
    by: ['hash'],
    where: {
      hash: { not: null },
    },
    _count: {
      id: true,
    },
    having: {
      id: {
        _count: { gt: 1 },
      },
    },
  });

  console.log(`Found ${duplicateGroups.length} duplicate hash group(s) in MediaAsset table.\n`);

  const report = [];

  for (let i = 0; i < duplicateGroups.length; i++) {
    const group = duplicateGroups[i];
    const assets = await prisma.mediaAsset.findMany({
      where: { hash: group.hash },
      include: {
        references: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    const groupData = {
      index: i + 1,
      hash: group.hash,
      assetCount: assets.length,
      assets: [],
    };

    for (const asset of assets) {
      const refsWithTitles = [];
      for (const ref of asset.references) {
        const title = await getEntityTitle(ref.entityType, ref.entityId);
        refsWithTitles.push({
          entityType: ref.entityType,
          entityId: ref.entityId,
          fieldPath: ref.fieldPath,
          title,
        });
      }

      groupData.assets.push({
        id: asset.id,
        fileName: asset.fileName,
        url: asset.url,
        mimeType: asset.mimeType,
        size: asset.size,
        status: asset.status,
        usageCount: asset.references.length,
        references: refsWithTitles,
      });
    }

    report.push(groupData);
  }

  // 2. Also check if any assets have null hash
  const nullHashCount = await prisma.mediaAsset.count({
    where: { hash: null },
  });
  console.log(`Assets with null hash: ${nullHashCount}`);

  // 3. Print the report
  console.log(JSON.stringify(report, null, 2));

  await prisma.$disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
