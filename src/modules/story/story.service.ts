import { Request, Response } from "express";
import prisma from "../../config/prisma.js";
import ApiError from "../../utils/api.error.js";

export const getStoryService = async (req: Request) => {
  const { id, slug, category, tagPlace, tagTheme, tagLens, search, journeyId, relatedToId } = req.query;

  // Single story fetch
  if (id || slug) {
    const filter: any = {};
    if (id) filter.id = String(id);
    if (slug) filter.slug = String(slug);

    const story = await prisma.story.findFirst({
      where: filter,
    });
    if (!story) {
      throw new ApiError("Story not found", 404);
    }
    return { data: story };
  }

  // Related Stories Algorithm endpoint query
  if (relatedToId) {
    const targetStory = await prisma.story.findUnique({
      where: { id: String(relatedToId) },
    });
    if (!targetStory) {
      throw new ApiError("Target story not found for related calculation", 404);
    }

    const targetDetail: any = targetStory.detail || {};
    const manualIds: string[] = targetDetail.manualRelatedStoryIds || [];
    const tPlace = targetDetail.tagPlace?.toLowerCase() || "";
    const tTheme = targetDetail.tagTheme?.toLowerCase() || "";
    const tLens = targetDetail.tagLens?.toLowerCase() || "";

    const allOtherStories = await prisma.story.findMany({
      where: {
        id: { not: targetStory.id },
      },
      orderBy: { createdAt: "desc" },
    });

    const scored = allOtherStories.map((story) => {
      const sDetail: any = story.detail || {};
      let score = 0;

      // Check manual override
      if (manualIds.includes(story.id)) {
        score += 10;
      }

      // Check tag matches
      const sPlace = sDetail.tagPlace?.toLowerCase() || "";
      const sTheme = sDetail.tagTheme?.toLowerCase() || "";
      const sLens = sDetail.tagLens?.toLowerCase() || "";

      if (tPlace && sPlace === tPlace) score += 2; // Extra weight for geography place
      if (tTheme && sTheme === tTheme) score += 1;
      if (tLens && sLens === tLens) score += 1;

      return { story, score };
    });

    const filteredAndSorted = scored
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .map((item) => item.story)
      .slice(0, 3);

    return { data: filteredAndSorted, meta: { total: filteredAndSorted.length } };
  }

  // General list query with filters
  const filter: any = {};
  if (category) filter.category = String(category);

  let stories = await prisma.story.findMany({
    where: filter,
    orderBy: { createdAt: "desc" },
  });

  // Perform memory/JSON property filter if advanced filters are present
  if (search || tagPlace || tagTheme || tagLens || journeyId) {
    const searchLower = search ? String(search).toLowerCase() : "";
    const placeLower = tagPlace ? String(tagPlace).toLowerCase() : "";
    const themeLower = tagTheme ? String(tagTheme).toLowerCase() : "";
    const lensLower = tagLens ? String(tagLens).toLowerCase() : "";
    const targetJourneyId = journeyId ? String(journeyId) : "";

    stories = stories.filter((story) => {
      const detail: any = story.detail || {};

      if (searchLower) {
        const matchesTitle = story.title.toLowerCase().includes(searchLower);
        const matchesDesc = story.description.toLowerCase().includes(searchLower);
        const matchesSlug = story.slug.toLowerCase().includes(searchLower);
        if (!matchesTitle && !matchesDesc && !matchesSlug) return false;
      }

      if (placeLower && (detail.tagPlace || "").toLowerCase() !== placeLower) {
        return false;
      }

      if (themeLower && (detail.tagTheme || "").toLowerCase() !== themeLower) {
        return false;
      }

      if (lensLower && (detail.tagLens || "").toLowerCase() !== lensLower) {
        return false;
      }

      if (targetJourneyId) {
        const jIds: string[] = detail.journeyIds || [];
        if (!jIds.includes(targetJourneyId)) return false;
      }

      return true;
    });
  }

  return { data: stories, meta: { total: stories.length } };
};

export const manageStoryService = async (req: Request, res: Response) => {
  const { id, ...data } = req.body;

  let story;
  if (id) {
    // UPDATE
    const existing = await prisma.story.findUnique({ where: { id } });
    if (!existing) {
      throw new ApiError("Story not found", 404);
    }

    const updateData: any = {};
    if (data.title !== undefined) updateData.title = data.title;
    if (data.slug !== undefined) updateData.slug = data.slug;
    if (data.category !== undefined) updateData.category = data.category;
    if (data.categories !== undefined) {
      updateData.categories = data.categories;
      if (data.categories.length > 0 && !data.category) {
        updateData.category = data.categories[0];
      }
    }
    if (data.description !== undefined) updateData.description = data.description;
    if (data.readTime !== undefined) updateData.readTime = data.readTime;
    if (data.image !== undefined) updateData.image = data.image;
    if (data.templateType !== undefined) updateData.templateType = data.templateType;
    if (data.detail !== undefined) updateData.detail = data.detail;

    story = await prisma.story.update({
      where: { id },
      data: updateData,
    });
  } else {
    // CREATE
    const existingSlug = await prisma.story.findUnique({
      where: { slug: data.slug },
    });
    if (existingSlug) {
      throw new ApiError("Story with this slug already exists", 400);
    }

    const cats =
      Array.isArray(data.categories) && data.categories.length > 0
        ? data.categories
        : data.category
        ? [data.category]
        : ["Culture & Heritage"];
    const primaryCat = data.category || cats[0];

    story = await prisma.story.create({
      data: {
        title: data.title,
        slug: data.slug,
        category: primaryCat,
        categories: cats,
        description: data.description,
        readTime: data.readTime,
        image: data.image,
        templateType: data.templateType || "long-story",
        detail: data.detail || {},
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

  const existing = await prisma.story.findUnique({ where: { id: String(id) } });
  if (!existing) {
    throw new ApiError("Story not found", 404);
  }

  await prisma.story.delete({
    where: { id: String(id) },
  });

  return { message: "Story deleted successfully" };
};
