import { manageRecordWithFiles } from "../../shared/manageRecordWithFiles.service.js";
import { deleteRecordsSafely } from "../../shared/delete.service.js";
import prisma from "../../config/prisma.js";
import { getRecords } from "../../shared/getRecords.service.js";

export const getExperienceService = async (req: any) => {
  const { name, slug, search, featured, parentId, priceType, minPrice, maxPrice } = req.query;

  const customWhere: any = {};

  // Parent Location ID filter
  if (parentId) {
    customWhere.parentId = parentId;
  }

  // Featured Filter - boolean match
  if (featured !== undefined && featured !== null && featured !== "") {
    customWhere.featured = String(featured).toLowerCase() === "true";
  }

  // Price Type Filter
  if (priceType) {
    customWhere.priceType = priceType;
  }

  // Price Range Filter
  if (minPrice !== undefined || maxPrice !== undefined) {
    customWhere.price = {};
    if (minPrice !== undefined && minPrice !== "") {
      customWhere.price.gte = Number(minPrice);
    }
    if (maxPrice !== undefined && maxPrice !== "") {
      customWhere.price.lte = Number(maxPrice);
    }
  }

  // Experience Name - Partial Match
  if (name) {
    customWhere.name = {
      contains: name,
      mode: "insensitive",
    };
  }

  // Experience Slug - Exact Match
  if (slug) {
    customWhere.slug = slug;
  }

  // Global Search across name and slug
  if (search) {
    const tokens: string[] = [
      ...new Set((search as string).trim().split(/\s+/)),
    ];

    customWhere.OR = tokens.map((token) => ({
      OR: [
        {
          name: {
            contains: token,
            mode: "insensitive",
          },
        },
        {
          slug: {
            contains: token,
            mode: "insensitive",
          },
        },
      ],
    }));
  }

  // Fetch records with parent location details
  const result = await getRecords({
    req,
    model: prisma.experience,
    customWhere,
    modelName: "Experience",
    include: {
      parent: {
        select: {
          id: true,
          name: true,
          slug: true,
          type: true,
          hero: true,
        },
      },
    },
  });

  return result;
};

export const manageExperienceService = async (req: any, res: any) => {
  if (req.validated?.body) {
    const { parent, parentId, ...rest } = req.validated.body;

    const sanitizedBody: any = { ...rest };

    // Handle Prisma relation for parent location
    if (parentId && typeof parentId === "string" && parentId.trim() !== "") {
      sanitizedBody.parent = {
        connect: { id: parentId.trim() },
      };
    } else if (req.validated.body.id && (parentId === null || parentId === "")) {
      sanitizedBody.parent = {
        disconnect: true,
      };
    }

    req.validated.body = sanitizedBody;
  }

  const result = await manageRecordWithFiles({
    req,
    res,
    prisma,
    model: prisma.experience,
    modelName: "experience",
    externalDomain: ["res.cloudinary.com"],
    attachUser: false,
    include: {
      parent: true,
    },
  });

  return result;
};

export const deleteExperienceService = async (req: any, res: any) => {
  const result = await deleteRecordsSafely({
    res,
    req,
    prisma,
    model: prisma.experience,
    modelName: "experience",
    softDelete: false,
    rawIds: req.body.id,
    externalDomain: ["res.cloudinary.com"],
    maxLimit: 10,
    txClient: prisma,
  });

  return result;
};

export const searchExperienceOptionsService = async (req: any) => {
  const { search, limit = 50, featured, parentId, priceType } = req.query;
  const where: any = {
    deletedAt: null,
  };

  if (parentId) {
    where.parentId = parentId;
  }

  if (featured !== undefined && featured !== null && featured !== "") {
    where.featured = String(featured).toLowerCase() === "true";
  }

  if (priceType) {
    where.priceType = priceType;
  }

  if (search && typeof search === "string" && search.trim()) {
    const trimmed = search.trim();
    where.OR = [
      { name: { contains: trimmed, mode: "insensitive" } },
      { slug: { contains: trimmed, mode: "insensitive" } },
    ];
  }

  const experiences = await prisma.experience.findMany({
    where,
    select: {
      id: true,
      name: true,
      slug: true,
      featured: true,
      price: true,
      priceType: true,
      hero: true,
      essence: true,
      parent: {
        select: {
          id: true,
          name: true,
          slug: true,
          type: true,
        },
      },
    },
    take: Number(limit) || 50,
    orderBy: {
      name: "asc",
    },
  });

  return {
    data: experiences,
    message: "Experience search options fetched successfully",
  };
};
