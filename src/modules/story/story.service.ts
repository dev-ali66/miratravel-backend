import { Request, Response } from "express";
import prisma from "../../config/prisma.js";
import ApiError from "../../utils/api.error.js";
import { auditLogger } from "../../logger/audit.logger.js";
import { getRecords } from "../../shared/getRecords.service.js";

const storyInclude = {
  categories: true,
  locations: true,
  journeys: true,
  manualRelatedStories: true,
};

const slugify = (text: string): string =>
  text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

const cleanJson = (val: any) => {
  if (val === undefined || val === null) return null;
  try {
    return JSON.parse(JSON.stringify(val));
  } catch {
    return null;
  }
};

export const getStoryService = async (req: Request) => {
  const {
    id,
    slug,
    category,
    type,
    status,
    featured,
    recommended,
    search,
    journeyId,
    locationId,
    relatedToId,
  } = (req as any).validated?.query || (req.query as any) || {};

  // -------------------------
  // Related Stories Algorithm endpoint query
  // -------------------------
  if (relatedToId) {
    const targetStory = await (prisma as any).story.findUnique({
      where: { id: String(relatedToId) },
      include: storyInclude,
    });
    if (!targetStory) {
      throw new ApiError("Target story not found for related calculation", 404);
    }

    const manualStories: any[] = targetStory.manualRelatedStories || [];
    const manualIds: string[] = manualStories.map((s: any) => s.id);
    const targetDetail: any = (targetStory as any).detail || (targetStory as any).data || {};
    const tPlace = targetDetail.tagPlace?.toLowerCase() || "";
    const tTheme = targetDetail.tagTheme?.toLowerCase() || "";
    const tLens = targetDetail.tagLens?.toLowerCase() || "";

    const allOtherStories = await (prisma as any).story.findMany({
      where: {
        id: { not: targetStory.id },
        deletedAt: null,
      },
      include: storyInclude,
      orderBy: { createdAt: "desc" },
    });

    const scored = allOtherStories.map((story: any) => {
      const sDetail: any = story.detail || story.data || {};
      let score = 0;

      // Check manual override
      if (manualIds.includes(story.id)) {
        score += 10;
      }

      // Check tag matches
      const sPlace = sDetail.tagPlace?.toLowerCase() || "";
      const sTheme = sDetail.tagTheme?.toLowerCase() || "";
      const sLens = sDetail.tagLens?.toLowerCase() || "";

      if (tPlace && sPlace === tPlace) score += 2;
      if (tTheme && sTheme === tTheme) score += 1;
      if (tLens && sLens === tLens) score += 1;

      return { story, score };
    });

    const filteredAndSorted = scored
      .filter((item: any) => item.score > 0)
      .sort((a: any, b: any) => b.score - a.score)
      .map((item: any) => item.story)
      .slice(0, 3);

    return {
      code: 200,
      success: true,
      message: `${filteredAndSorted.length} : Related stories fetched successfully`,
      meta: { total: filteredAndSorted.length, page: 1, limit: 3, totalPages: 1 },
      data: filteredAndSorted,
    };
  }

  const customWhere: any = {};

  // -------------------------
  // Existing Filters
  // -------------------------

  // Exact ID match
  if (id) {
    customWhere.id = String(id);
  }

  // Exact Slug match
  if (slug) {
    customWhere.slug = String(slug);
  }

  // Story Type match
  if (type) {
    customWhere.type = String(type);
  }

  // Story Status match
  if (status) {
    customWhere.status = String(status).toUpperCase();
  }

  // Featured Filter - boolean match
  if (featured !== undefined && featured !== null && featured !== "") {
    customWhere.featured = String(featured).toLowerCase() === "true";
  }

  // Recommended Filter - boolean match
  if (recommended !== undefined && recommended !== null && recommended !== "") {
    customWhere.recommended = String(recommended).toLowerCase() === "true";
  }

  // Category Filter - match category by name or slug
  if (category) {
    customWhere.categories = {
      some: {
        OR: [
          { name: { contains: String(category), mode: "insensitive" } },
          { slug: { contains: String(category), mode: "insensitive" } },
        ],
      },
    };
  }

  // Relation filtering by Journey ID
  if (journeyId) {
    customWhere.journeys = {
      some: { id: String(journeyId) },
    };
  }

  // Relation filtering by Location ID
  if (locationId) {
    customWhere.locations = {
      some: { id: String(locationId) },
    };
  }

  // -------------------------
  // Global Search
  // -------------------------
  if (search) {
    const tokens: string[] = [
      ...new Set((search as string).trim().split(/\s+/)),
    ];

    customWhere.OR = tokens.map((token) => ({
      OR: [
        { title: { contains: token, mode: "insensitive" } },
        { slug: { contains: token, mode: "insensitive" } },
        { authorName: { contains: token, mode: "insensitive" } },
        { authorRole: { contains: token, mode: "insensitive" } },
      ],
    }));
  }

  // -------------------------
  // Get Records
  // -------------------------
  const result = await getRecords({
    req,
    model: (prisma as any).story,
    customWhere,
    modelName: "Story",
    include: storyInclude,
    excludeFilterKeys: [
      "page",
      "limit",
      "id",
      "slug",
      "category",
      "type",
      "status",
      "featured",
      "recommended",
      "search",
      "journeyId",
      "locationId",
      "relatedToId",
      "tagPlace",
      "tagTheme",
      "tagLens",
    ],
  });

  return result;
};

export const manageStoryService = async (req: Request, res: Response) => {
  const body = (req as any).validated?.body || req.body || {};
  const { id, ...data } = body;

  // 1. Sanitize & extract primitive field values
  const titleToUse = data.title ? String(data.title).trim() : "Untitled Story";
  const baseSlug = data.slug || slugify(titleToUse) || "untitled-story";

  const typeToUse = data.type || data.templateType || "short_story";
  const statusToUse = data.status ? String(data.status).toUpperCase() : "PUBLISH";
  const readTime = data.readTime !== undefined ? String(data.readTime) : "";
  const authorName = data.authorName !== undefined ? String(data.authorName) : "";
  const authorRole = data.authorRole !== undefined ? String(data.authorRole) : "";
  const featured = Boolean(data.featured);
  const recommended = Boolean(data.recommended);

  // 2. Sanitize rich JSON objects
  const hero = cleanJson(data.hero) || {};
  const intro = cleanJson(data.intro) || {};
  const blocks = cleanJson(data.blocks) || [];
  const practicalNotes = cleanJson(data.practicalNotes !== undefined ? data.practicalNotes : data.practicalNotesData) || [];
  const seo = cleanJson(data.seo) || {};

  // 3. Extract & sanitize relation string arrays
  const rawCategories = Array.isArray(data.categories)
    ? data.categories
    : data.category
    ? [data.category]
    : [];

  const categoryNames: string[] = rawCategories
    .map((c: any) => (typeof c === "string" ? c : c?.name || c?.id || ""))
    .filter((c: string) => typeof c === "string" && c.trim() !== "");

  const rawLocations = Array.isArray(data.locations) && data.locations.length > 0
    ? data.locations
    : Array.isArray(data.locationIds)
    ? data.locationIds
    : Array.isArray(data.locations)
    ? data.locations
    : [];

  const locationIds: string[] = rawLocations
    .map((l: any) => (typeof l === "string" ? l : l?.id || ""))
    .filter((l: string) => typeof l === "string" && l.trim() !== "");

  const rawJourneys = Array.isArray(data.journeys) && data.journeys.length > 0
    ? data.journeys
    : Array.isArray(data.journeyIds)
    ? data.journeyIds
    : Array.isArray(data.journeys)
    ? data.journeys
    : [];

  const journeyIds: string[] = rawJourneys
    .map((j: any) => (typeof j === "string" ? j : j?.id || ""))
    .filter((j: string) => typeof j === "string" && j.trim() !== "");

  const rawRelIds = Array.isArray(data.manualRelatedStories) && data.manualRelatedStories.length > 0
    ? data.manualRelatedStories
    : Array.isArray(data.manualRelatedStoryIds)
    ? data.manualRelatedStoryIds
    : Array.isArray(data.manualRelatedStories)
    ? data.manualRelatedStories
    : Array.isArray(data.relatedStories)
    ? data.relatedStories
    : Array.isArray(data.detail?.manualRelatedStoryIds)
    ? data.detail.manualRelatedStoryIds
    : [];

  const relIds: string[] = rawRelIds
    .map((r: any) => (typeof r === "string" ? r : r?.id || ""))
    .filter((r: string) => typeof r === "string" && r.trim() !== "");

  // 4. Pre-resolve Categories
  const resolvedCategoryConnects: { id: string }[] = [];
  for (const catName of categoryNames) {
    const catSlug = slugify(catName);
    if (!catSlug) continue;

    const existingCat = await (prisma as any).storyCategory.findFirst({
      where: {
        OR: [{ name: catName }, { slug: catSlug }],
      },
    });

    if (existingCat) {
      resolvedCategoryConnects.push({ id: existingCat.id });
    } else {
      const createdCat = await (prisma as any).storyCategory.create({
        data: {
          name: catName,
          slug: catSlug,
        },
      });
      resolvedCategoryConnects.push({ id: createdCat.id });
    }
  }

  // 5. Pre-validate existing Location, Journey, and Story IDs
  const validLocations = locationIds.length > 0
    ? await (prisma as any).location.findMany({
        where: { id: { in: locationIds } },
        select: { id: true },
      })
    : [];
  const locationConnects = validLocations.map((l: any) => ({ id: l.id }));

  const validJourneys = journeyIds.length > 0
    ? await (prisma as any).journey.findMany({
        where: { id: { in: journeyIds } },
        select: { id: true },
      })
    : [];
  const journeyConnects = validJourneys.map((j: any) => ({ id: j.id }));

  const validStories = relIds.length > 0
    ? await (prisma as any).story.findMany({
        where: { id: { in: relIds } },
        select: { id: true },
      })
    : [];
  const storyConnects = validStories.map((s: any) => ({ id: s.id }));

  let story;
  if (id) {
    // UPDATE
    const existing = await (prisma as any).story.findUnique({ where: { id: String(id) } });
    if (!existing) {
      throw new ApiError("Story not found", 404);
    }

    // Ensure unique slug for update
    let finalSlug = baseSlug;
    const existingOtherSlug = await (prisma as any).story.findFirst({
      where: { slug: finalSlug, id: { not: String(id) } },
    });
    if (existingOtherSlug) {
      finalSlug = `${baseSlug}-${Date.now().toString(36)}`;
    }

    const updateData: any = {};
    if (data.title !== undefined) updateData.title = titleToUse;
    updateData.slug = finalSlug;
    if (data.type !== undefined || data.templateType !== undefined) updateData.type = typeToUse;
    if (data.status !== undefined) updateData.status = statusToUse;
    if (data.readTime !== undefined) updateData.readTime = readTime;
    if (data.authorName !== undefined) updateData.authorName = authorName;
    if (data.authorRole !== undefined) updateData.authorRole = authorRole;
    if (data.featured !== undefined) updateData.featured = featured;
    if (data.recommended !== undefined) updateData.recommended = recommended;
    if (data.hero !== undefined) updateData.hero = hero;
    if (data.intro !== undefined) updateData.intro = intro;
    if (data.blocks !== undefined) updateData.blocks = blocks;
    if (data.practicalNotes !== undefined) updateData.practicalNotes = practicalNotes;
    if (data.seo !== undefined) updateData.seo = seo;

    updateData.categories = { set: resolvedCategoryConnects };
    updateData.locations = { set: locationConnects };
    updateData.journeys = { set: journeyConnects };
    updateData.manualRelatedStories = { set: storyConnects };

    story = await (prisma as any).story.update({
      where: { id: String(id) },
      data: updateData,
      include: {
        categories: true,
        locations: true,
        journeys: true,
        manualRelatedStories: true,
      },
    });

    // Audit Log: Story Updated
    await auditLogger({
      req,
      action: "STORY_UPDATED",
      entity: "Story",
      entityId: story.id,
      status: "SUCCESS",
      metadata: {
        description: `Updated editorial story '${story.title}' (${story.slug}).`,
      },
    });
  } else {
    // CREATE
    if (!titleToUse) {
      throw new ApiError("Title is required to create a story", 400);
    }

    // Ensure unique slug for create
    let finalSlug = baseSlug;
    const existingSlug = await (prisma as any).story.findFirst({
      where: { slug: finalSlug },
    });
    if (existingSlug) {
      finalSlug = `${baseSlug}-${Date.now().toString(36)}`;
    }

    const createPayload: any = {
      title: titleToUse,
      slug: finalSlug,
      type: typeToUse,
      status: statusToUse,
      readTime,
      authorName,
      authorRole,
      featured,
      recommended,
      hero,
      intro,
      blocks,
      practicalNotes,
      seo,
      categories: { connect: resolvedCategoryConnects },
      locations: { connect: locationConnects },
      journeys: { connect: journeyConnects },
      manualRelatedStories: { connect: storyConnects },
    };

    story = await (prisma as any).story.create({
      data: createPayload,
      include: {
        categories: true,
        locations: true,
        journeys: true,
        manualRelatedStories: true,
      },
    });

    // Audit Log: Story Created
    await auditLogger({
      req,
      action: "STORY_PUBLISHED",
      entity: "Story",
      entityId: story.id,
      status: "SUCCESS",
      metadata: {
        description: `Published new editorial story '${story.title}' (${story.slug}).`,
      },
    });
  }

  return { data: story };
};

export const deleteStoryService = async (req: Request, res: Response) => {
  const { id } = req.query;
  if (!id) {
    throw new ApiError("Story ID is required", 400);
  }

  const existing = await (prisma as any).story.findUnique({ where: { id: String(id) } });
  if (!existing) {
    throw new ApiError("Story not found", 404);
  }

  await (prisma as any).story.delete({
    where: { id: String(id) },
  });

  // Audit Log: Story Deleted
  await auditLogger({
    req,
    action: "STORY_DELETED",
    entity: "Story",
    entityId: String(id),
    status: "WARNING",
    metadata: {
      description: `Deleted editorial story '${existing.title}'.`,
    },
  });

  return { message: "Story deleted successfully" };
};
