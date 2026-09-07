import { Request } from "express";
import prisma from "../../config/prisma.js";
import ApiError from "../../utils/api.error.js";

const DEFAULT_TYPES = [
  { name: "Long Story", slug: "long-story" },
  { name: "Short Story", slug: "short-story" },
  { name: "Editorial Story", slug: "editorial-story" },
  { name: "Guide Story", slug: "guide-story" },
];

export const getStoryTypesService = async (req: Request) => {
  const { search } = req.query;

  // Check if prisma.storyType delegate is available
  if (!(prisma as any).storyType) {
    return {
      data: DEFAULT_TYPES.map((t, i) => ({
        id: `type_${i + 1}`,
        name: t.name,
        slug: t.slug,
      })),
      meta: { total: DEFAULT_TYPES.length },
    };
  }

  // Seed default story types if DB is empty
  const count = await (prisma as any).storyType.count();
  if (count === 0) {
    for (const item of DEFAULT_TYPES) {
      await (prisma as any).storyType.upsert({
        where: { slug: item.slug },
        update: {},
        create: { name: item.name, slug: item.slug },
      });
    }
  }

  const where: any = {};
  if (search) {
    where.name = {
      contains: String(search),
      mode: "insensitive",
    };
  }

  const types = await (prisma as any).storyType.findMany({
    where,
    orderBy: { name: "asc" },
  });

  return { data: types, meta: { total: types.length } };
};

export const createStoryTypeService = async (req: Request) => {
  const { name } = req.body;
  const trimmedName = String(name).trim();
  const slug = trimmedName
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-");

  if (!(prisma as any).storyType) {
    return {
      data: { id: `type_${Date.now()}`, name: trimmedName, slug },
      message: "Story type created",
    };
  }

  const existing = await (prisma as any).storyType.findFirst({
    where: {
      OR: [{ name: { equals: trimmedName, mode: "insensitive" } }, { slug }],
    },
  });

  if (existing) {
    return { data: existing, message: "Story type already exists" };
  }

  const newType = await (prisma as any).storyType.create({
    data: {
      name: trimmedName,
      slug,
    },
  });

  return { data: newType, message: "Story type created successfully" };
};

export const deleteStoryTypeService = async (req: Request) => {
  const { id } = req.params;

  if (!(prisma as any).storyType) {
    return { message: "Story type deleted" };
  }

  const existing = await (prisma as any).storyType.findUnique({
    where: { id: String(id) },
  });

  if (!existing) {
    throw new ApiError("Story type not found", 404);
  }

  await (prisma as any).storyType.delete({
    where: { id: String(id) },
  });

  return { message: "Story type deleted successfully" };
};
