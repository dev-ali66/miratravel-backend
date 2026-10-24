import { StatusCodes } from "http-status-codes";
import path from "path";
import { Prisma } from "@prisma/client";
import prisma from "../config/prisma.js";
import ApiError from "../utils/api.error.js";
import { extractMediaReferences } from "../utils/mediaExtractor.js";

export interface PopulatedMediaReference {
  id: string;
  mediaId: string;
  entityType: string;
  entityId: string;
  fieldPath: string;
  entityTitle: string;
  entitySlug?: string;
  editUrl?: string;
  createdAt: Date;
}

export interface MediaUsageReport {
  mediaId: string;
  usageCount: number;
  references: PopulatedMediaReference[];
}

/**
 * Dynamic lookup table built directly from Prisma.ModelName.
 * Automatically stays up-to-date whenever any new model/table is added to schema.prisma
 * without requiring manual code modifications.
 */
const PRISMA_MODEL_MAP = new Map<string, string>();

for (const model of Object.values(Prisma.ModelName) as string[]) {
  const clean = model.toLowerCase().replace(/[^a-z0-9]/g, "");
  PRISMA_MODEL_MAP.set(clean, model);
  PRISMA_MODEL_MAP.set(model.toLowerCase(), model);
}

// User-friendly shorthand aliases
const ENTITY_ALIASES: Record<string, string> = {
  cms: "CmsPage",
  cmspage: "CmsPage",
  settings: "SiteSettings",
  sitesettings: "SiteSettings",
  user: "Auth",
  users: "Auth",
};
for (const [alias, target] of Object.entries(ENTITY_ALIASES)) {
  PRISMA_MODEL_MAP.set(alias.toLowerCase().replace(/[^a-z0-9]/g, ""), target);
}

/**
 * Normalizes any entity name (case-insensitive, kebab-case, snake_case, shorthand aliases)
 * to its exact canonical Prisma ModelName automatically.
 */
export function normalizeEntityType(name: string): string {
  if (!name) return name;
  const clean = name.trim().toLowerCase().replace(/[^a-z0-9]/g, "");
  const matched = PRISMA_MODEL_MAP.get(clean);
  if (matched) return matched;

  // Fallback if entity is not in Prisma (e.g. ad-hoc entity): PascalCase formatting
  return name
    .trim()
    .split(/[-_\s]+/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");
}

function toPluralKebab(name: string): string {
  const kebab = name.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
  if (kebab.endsWith("y") && !/[aeiou]y$/.test(kebab)) {
    return kebab.slice(0, -1) + "ies";
  }
  if (
    kebab.endsWith("s") ||
    kebab.endsWith("x") ||
    kebab.endsWith("z") ||
    kebab.endsWith("ch") ||
    kebab.endsWith("sh")
  ) {
    return kebab + "es";
  }
  return kebab + "s";
}

/**
 * Resolves human-readable entity title and direct admin dashboard navigation URL.
 * Completely schema-driven and dynamic for any existing or future Prisma model.
 */
async function resolveEntityMetadata(
  rawEntityType: string,
  entityId: string
): Promise<{ title: string; slug?: string; editUrl?: string }> {
  const entityType = normalizeEntityType(rawEntityType);
  try {
    if (entityType === "SiteSettings") {
      return {
        title: "Site Settings",
        editUrl: "/settings",
      };
    }

    const delegateName = entityType.charAt(0).toLowerCase() + entityType.slice(1);
    const delegate = (prisma as any)[delegateName];
    let item: any = null;

    if (delegate && typeof delegate.findUnique === "function") {
      try {
        item = await delegate.findUnique({
          where: { id: entityId },
        });
      } catch {
        // Fallback if entity doesn't use standard id primary key
      }
    }

    if (entityType === "CmsPage") {
      const pageSlug = item?.slug || entityId;
      return {
        title: item?.name || `CMS Page (${pageSlug})`,
        slug: item?.slug,
        editUrl: `/cms/${pageSlug}`,
      };
    }

    if (entityType === "Story") {
      const storySlug = item?.slug || entityId;
      return {
        title: item?.title || `Story (${storySlug})`,
        slug: item?.slug,
        editUrl: item?.slug ? `/stories/${item.slug}` : `/stories/${entityId}`,
      };
    }

    const title =
      item?.title ||
      item?.name ||
      item?.fullName ||
      item?.headline ||
      item?.siteName ||
      item?.label ||
      `${entityType} (${entityId})`;

    const slug = item?.slug;
    const basePath = "/" + toPluralKebab(entityType);
    const editUrl = slug ? `${basePath}/${entityId}/${slug}` : `${basePath}/${entityId}`;

    return {
      title,
      slug,
      editUrl,
    };
  } catch {
    return { title: `${entityType} (${entityId})` };
  }
}

/**
 * Returns comprehensive usage details for a given MediaAsset,
 * including total count and human-readable referencing entity information.
 */
export async function getMediaUsage(mediaId: string): Promise<MediaUsageReport> {
  const references = await prisma.mediaReference.findMany({
    where: { mediaId },
    orderBy: { createdAt: "desc" },
  });

  const populated: PopulatedMediaReference[] = await Promise.all(
    references.map(async (ref) => {
      const meta = await resolveEntityMetadata(ref.entityType, ref.entityId);
      return {
        id: ref.id,
        mediaId: ref.mediaId,
        entityType: normalizeEntityType(ref.entityType),
        entityId: ref.entityId,
        fieldPath: ref.fieldPath,
        entityTitle: meta.title,
        entitySlug: meta.slug,
        editUrl: meta.editUrl,
        createdAt: ref.createdAt,
      };
    })
  );

  return {
    mediaId,
    usageCount: populated.length,
    references: populated,
  };
}

/**
 * Blocks deletion if the asset is actively used in any entity across the system.
 * Throws HTTP 409 Conflict with full details of referencing entities.
 */
export async function assertMediaCanBeDeleted(mediaId: string): Promise<void> {
  const usage = await getMediaUsage(mediaId);

  if (usage.usageCount > 0) {
    const previewList = usage.references
      .slice(0, 3)
      .map((r) => `${r.entityType} '${r.entityTitle}' (${r.fieldPath})`)
      .join(", ");
    const andMore = usage.usageCount > 3 ? ` and ${usage.usageCount - 3} more` : "";

    throw new ApiError(
      `Cannot delete media asset because it is actively used in ${usage.usageCount} place(s): ${previewList}${andMore}. Please replace or remove the asset from those records first.`,
      StatusCodes.CONFLICT,
      {
        usageCount: usage.usageCount,
        references: usage.references,
      }
    );
  }
}

/**
 * Traverses an entity record, extracts all referenced media URLs,
 * updates the MediaReference join table, and auto-restores any referenced assets from trash.
 * If an asset becomes completely unreferenced, moves it safely to IN_TRASH with 30-day outbox job.
 */
export async function syncEntityMediaReferences(
  rawEntityType: string,
  entityId: string,
  recordData: any
): Promise<{ added: number; removed: number; retained: number; unreferencedTrashed: number }> {
  const entityType = normalizeEntityType(rawEntityType);

  // 1. Extract all media references from the updated record
  const extracted = extractMediaReferences(recordData);

  // 2. Fetch all existing references for this entity
  const existingRefs = await prisma.mediaReference.findMany({
    where: { entityType, entityId },
  });

  // Map existing by key: `${mediaId}:${fieldPath}`
  const existingMap = new Map<string, { id: string; mediaId: string }>();
  for (const r of existingRefs) {
    existingMap.set(`${r.mediaId}:${r.fieldPath}`, { id: r.id, mediaId: r.mediaId });
  }

  // 3. Match extracted URLs to MediaAsset IDs
  const desiredKeys = new Set<string>();
  const desiredItems: { mediaId: string; fieldPath: string }[] = [];

  for (const item of extracted) {
    const rawUrl = item.url;
    const baseName = path.basename(rawUrl.split("?")[0]);

    // Try matching by exact URL or fileName
    let asset = await prisma.mediaAsset.findFirst({
      where: {
        OR: [{ url: rawUrl }, { fileName: baseName }],
      },
      select: { id: true, status: true },
    });

    // Auto-register discovered media into MediaAsset if missing
    if (
      !asset &&
      rawUrl &&
      (rawUrl.startsWith("http://") || rawUrl.startsWith("https://") || rawUrl.startsWith("/"))
    ) {
      try {
        asset = await prisma.mediaAsset.create({
          data: {
            fileName: baseName || "media-asset",
            storagePath: rawUrl,
            url: rawUrl,
            mimeType: baseName.endsWith(".mp4") ? "video/mp4" : "image/jpeg",
            size: 0,
            status: "ACTIVE",
          },
          select: { id: true, status: true },
        });
      } catch {
        asset = await prisma.mediaAsset.findFirst({
          where: { OR: [{ url: rawUrl }, { fileName: baseName }] },
          select: { id: true, status: true },
        });
      }
    }

    if (asset) {
      const key = `${asset.id}:${item.fieldPath}`;
      if (!desiredKeys.has(key)) {
        desiredKeys.add(key);
        desiredItems.push({ mediaId: asset.id, fieldPath: item.fieldPath });
      }

      // Auto-restore asset if it was in trash
      if (asset.status === "IN_TRASH") {
        await prisma.mediaAsset.update({
          where: { id: asset.id },
          data: { status: "ACTIVE", deletedAt: null },
        });

        // Cancel pending outbox deletion jobs
        await prisma.mediaDeletionJob.updateMany({
          where: { mediaId: asset.id, status: "PENDING" },
          data: { status: "COMPLETED" },
        });

        // Audit Log
        await prisma.mediaAuditLog.create({
          data: {
            mediaId: asset.id,
            action: "RESTORE",
            performedBy: "SYSTEM",
            details: {
              reason: "referenced_by_entity",
              entityType,
              entityId,
              fieldPath: item.fieldPath,
            },
          },
        });
      }
    }
  }

  // 4. Identify deletions (existing in DB but not desired anymore)
  const idsToDelete: string[] = [];
  const affectedMediaIds = new Set<string>();

  for (const [key, val] of existingMap.entries()) {
    if (!desiredKeys.has(key)) {
      idsToDelete.push(val.id);
      affectedMediaIds.add(val.mediaId);
    }
  }

  if (idsToDelete.length > 0) {
    await prisma.mediaReference.deleteMany({
      where: { id: { in: idsToDelete } },
    });
  }

  // 5. Handle unreferenced assets -> 30-day soft-delete trash & Outbox job
  let unreferencedCount = 0;
  for (const mediaId of affectedMediaIds) {
    const remaining = await prisma.mediaReference.count({
      where: { mediaId },
    });

    if (remaining === 0) {
      const asset = await prisma.mediaAsset.findUnique({
        where: { id: mediaId },
        select: { id: true, status: true, storagePath: true },
      });

      if (asset && asset.status === "ACTIVE") {
        const now = new Date();
        const scheduledFor = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

        await prisma.mediaAsset.update({
          where: { id: mediaId },
          data: { status: "IN_TRASH", deletedAt: now },
        });

        await prisma.mediaDeletionJob.create({
          data: {
            mediaId,
            filePath: asset.storagePath,
            scheduledFor,
            status: "PENDING",
          },
        });

        await prisma.mediaAuditLog.create({
          data: {
            mediaId,
            action: "MOVE_TO_TRASH",
            performedBy: "SYSTEM",
            details: {
              reason: "unreferenced_after_entity_update",
              entityType,
              entityId,
              gracePeriodDays: 30,
            },
          },
        });

        unreferencedCount++;
      }
    }
  }

  // 6. Identify additions (desired but not yet in DB)
  let addedCount = 0;
  for (const item of desiredItems) {
    const key = `${item.mediaId}:${item.fieldPath}`;
    if (!existingMap.has(key)) {
      try {
        await prisma.mediaReference.create({
          data: {
            mediaId: item.mediaId,
            entityType,
            entityId,
            fieldPath: item.fieldPath,
          },
        });
        addedCount++;
      } catch {
        // Unique composite constraint race condition guard
      }
    }
  }

  return {
    added: addedCount,
    removed: idsToDelete.length,
    retained: desiredItems.length - addedCount,
    unreferencedTrashed: unreferencedCount,
  };
}

/**
 * Removes all media references associated with an entity upon its hard deletion.
 * Any media assets that become completely unreferenced move to IN_TRASH with 30-day outbox job.
 */
export async function removeEntityMediaReferences(
  rawEntityType: string,
  entityId: string
): Promise<{ removedReferences: number; unreferencedTrashed: number }> {
  const entityType = normalizeEntityType(rawEntityType);

  const existingRefs = await prisma.mediaReference.findMany({
    where: { entityType, entityId },
    select: { id: true, mediaId: true },
  });

  if (existingRefs.length === 0) {
    return { removedReferences: 0, unreferencedTrashed: 0 };
  }

  const affectedMediaIds = [...new Set(existingRefs.map((r) => r.mediaId))];

  const deleteResult = await prisma.mediaReference.deleteMany({
    where: { entityType, entityId },
  });

  let unreferencedCount = 0;
  for (const mediaId of affectedMediaIds) {
    const remaining = await prisma.mediaReference.count({
      where: { mediaId },
    });

    if (remaining === 0) {
      const asset = await prisma.mediaAsset.findUnique({
        where: { id: mediaId },
        select: { id: true, status: true, storagePath: true },
      });

      if (asset && asset.status === "ACTIVE") {
        const now = new Date();
        const scheduledFor = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

        await prisma.mediaAsset.update({
          where: { id: mediaId },
          data: { status: "IN_TRASH", deletedAt: now },
        });

        await prisma.mediaDeletionJob.create({
          data: {
            mediaId,
            filePath: asset.storagePath,
            scheduledFor,
            status: "PENDING",
          },
        });

        await prisma.mediaAuditLog.create({
          data: {
            mediaId,
            action: "MOVE_TO_TRASH",
            performedBy: "SYSTEM",
            details: {
              reason: "unreferenced_after_entity_deletion",
              entityType,
              entityId,
              gracePeriodDays: 30,
            },
          },
        });

        unreferencedCount++;
      }
    }
  }

  return {
    removedReferences: deleteResult.count,
    unreferencedTrashed: unreferencedCount,
  };
}
