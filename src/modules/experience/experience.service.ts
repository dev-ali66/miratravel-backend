import { manageRecordWithFiles } from "../../shared/manageRecordWithFiles.service.js";
import { deleteRecordsSafely } from "../../shared/delete.service.js";
import prisma from "../../config/prisma.js";
import { getRecords } from "../../shared/getRecords.service.js";

export const getExperienceService = async (req: any) => {
  const {
    name,
    slug,
    search,
    featured,
    status,
    primaryType,
    countryId,
    regionId,
    placeId,
    parentId,
    priceType,
    currency,
    minPrice,
    maxPrice,
  } = req.query;

  const customWhere: any = {};

  if (status) {
    customWhere.status = status;
  }

  if (primaryType) {
    customWhere.primaryType = primaryType;
  }

  if (countryId) {
    customWhere.countryId = countryId;
  }

  if (regionId) {
    customWhere.regionId = regionId;
  }

  if (placeId) {
    customWhere.placeId = placeId;
  }

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

  // Currency Filter
  if (currency) {
    customWhere.currency = currency;
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

  // Fetch records with location details and related entities
  const result = await getRecords({
    req,
    model: prisma.experience,
    customWhere,
    modelName: "Experience",
    include: {
      country: {
        select: {
          id: true,
          name: true,
          slug: true,
          type: true,
        },
      },
      region: {
        select: {
          id: true,
          name: true,
          slug: true,
          type: true,
        },
      },
      place: {
        select: {
          id: true,
          name: true,
          slug: true,
          type: true,
        },
      },
      journeys: {
        select: {
          id: true,
          title: true,
          slug: true,
          price: true,
          currency: true,
          hero: true,
          status: true,
        },
      },
      stories: {
        select: {
          id: true,
          title: true,
          slug: true,
          hero: true,
          status: true,
        },
      },
    },
    excludeFilterKeys: [
      "page",
      "limit",
      "id",
      "slug",
      "name",
      "featured",
      "status",
      "primaryType",
      "secondaryTypes",
      "attributes",
      "countryId",
      "regionId",
      "placeId",
      "parentId",
      "priceType",
      "currency",
      "minPrice",
      "maxPrice",
      "search",
    ],
  });

  return result;
};

export const manageExperienceService = async (req: any, res: any) => {
  if (req.validated?.body) {
    const {
      parent,
      parentId,
      country,
      countryId,
      region,
      regionId,
      place,
      placeId,
      journeys,
      stories,
      ...rest
    } = req.validated.body;

    const sanitizedBody: any = { ...rest };

    // Format Decimal price
    if (sanitizedBody.price !== undefined && sanitizedBody.price !== null && sanitizedBody.price !== "") {
      sanitizedBody.price = Number(Number(sanitizedBody.price).toFixed(2));
    }

    // Set foreign key scalar IDs
    sanitizedBody.countryId = countryId && countryId.trim() !== "" ? countryId.trim() : null;
    sanitizedBody.regionId = regionId && regionId.trim() !== "" ? regionId.trim() : null;
    sanitizedBody.placeId = placeId && placeId.trim() !== "" ? placeId.trim() : null;

    // Many-to-Many Journeys
    if (Array.isArray(journeys)) {
      if (req.validated.body.id) {
        sanitizedBody.journeys = {
          set: journeys.filter(Boolean).map((jId: string) => ({ id: jId })),
        };
      } else if (journeys.filter(Boolean).length > 0) {
        sanitizedBody.journeys = {
          connect: journeys.filter(Boolean).map((jId: string) => ({ id: jId })),
        };
      }
    }

    // Many-to-Many Stories
    if (Array.isArray(stories)) {
      if (req.validated.body.id) {
        sanitizedBody.stories = {
          set: stories.filter(Boolean).map((sId: string) => ({ id: sId })),
        };
      } else if (stories.filter(Boolean).length > 0) {
        sanitizedBody.stories = {
          connect: stories.filter(Boolean).map((sId: string) => ({ id: sId })),
        };
      }
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
      country: true,
      region: true,
      place: true,
      journeys: {
        select: {
          id: true,
          title: true,
          slug: true,
          hero: true,
        },
      },
      stories: {
        select: {
          id: true,
          title: true,
          slug: true,
          hero: true,
        },
      },
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
  const {
    search,
    limit = 50,
    featured,
    status,
    primaryType,
    countryId,
    regionId,
    placeId,
    parentId,
    priceType,
    currency,
  } = req.query;

  const where: any = {
    deletedAt: null,
  };

  if (status) {
    where.status = status;
  }

  if (primaryType) {
    where.primaryType = primaryType;
  }

  if (countryId) {
    where.countryId = countryId;
  }

  if (regionId) {
    where.regionId = regionId;
  }

  if (placeId) {
    where.placeId = placeId;
  }

  if (parentId) {
    where.parentId = parentId;
  }

  if (featured !== undefined && featured !== null && featured !== "") {
    where.featured = String(featured).toLowerCase() === "true";
  }

  if (priceType) {
    where.priceType = priceType;
  }

  if (currency) {
    where.currency = currency;
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
      status: true,
      primaryType: true,
      secondaryTypes: true,
      attributes: true,
      featured: true,
      price: true,
      currency: true,
      priceType: true,
      hero: true,
      essence: true,
      country: {
        select: {
          id: true,
          name: true,
          slug: true,
          type: true,
        },
      },
      region: {
        select: {
          id: true,
          name: true,
          slug: true,
          type: true,
        },
      },
      place: {
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
