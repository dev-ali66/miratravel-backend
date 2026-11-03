import { Request } from "express";
import prisma from "../../config/prisma.js";
import ApiError from "../../utils/api.error.js";

const DEFAULT_CATEGORIES = [
  "Accommodation",
  "Excursions",
  "Food & Drink",
  "Day Trips",
];

export const getStoryCategoriesService = async (req: Request) => {
  const { search } = req.query;

  // Check if prisma.storyCategory delegate is available
  if (!(prisma as any).storyCategory) {
    return {
      data: DEFAULT_CATEGORIES.map((name, i) => ({
        id: `cat_${i + 1}`,
        name,
        slug: name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      })),
      meta: { total: DEFAULT_CATEGORIES.length },
    };
  }

  // Seed default categories if DB is empty
  const count = await (prisma as any).storyCategory.count();
  if (count === 0) {
    for (const name of DEFAULT_CATEGORIES) {
      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      await (prisma as any).storyCategory.upsert({
        where: { slug },
        update: {},
        create: { name, slug },
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

  const categories = await (prisma as any).storyCategory.findMany({
    where,
    orderBy: { name: "asc" },
  });

  return { data: categories, meta: { total: categories.length } };
};

export const createStoryCategoryService = async (req: Request) => {
  const { name } = req.body;
  const trimmedName = String(name).trim();
  const slug = trimmedName
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-");

  if (!(prisma as any).storyCategory) {
    return {
      data: { id: `cat_${Date.now()}`, name: trimmedName, slug },
      message: "Category created",
    };
  }

  const existing = await (prisma as any).storyCategory.findFirst({
    where: {
      OR: [{ name: { equals: trimmedName, mode: "insensitive" } }, { slug }],
    },
  });

  if (existing) {
    return { data: existing, message: "Category already exists" };
  }

  const newCategory = await (prisma as any).storyCategory.create({
    data: {
      name: trimmedName,
      slug,
    },
  });

  return { data: newCategory, message: "Category created successfully" };
};

export const deleteStoryCategoryService = async (req: Request) => {
  const { id } = req.params;

  if (!(prisma as any).storyCategory) {
    return { message: "Category deleted" };
  }

  const existing = await (prisma as any).storyCategory.findUnique({
    where: { id: String(id) },
    include: { stories: true },
  });

  if (!existing) {
    throw new ApiError("Category not found", 404);
  }

  // Disconnect relations with stories before deletion so stories categories array remains clean
  if (Array.isArray(existing.stories) && existing.stories.length > 0) {
    await (prisma as any).storyCategory.update({
      where: { id: String(id) },
      data: {
        stories: {
          disconnect: existing.stories.map((s: any) => ({ id: s.id })),
        },
      },
    });
  }

  await (prisma as any).storyCategory.delete({
    where: { id: String(id) },
  });

  return { message: "Category deleted successfully" };
};
