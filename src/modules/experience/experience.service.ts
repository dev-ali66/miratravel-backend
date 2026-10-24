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
    customWhere.countries = { some: { id: countryId } };
  }

  if (regionId) {
    customWhere.regions = { some: { id: regionId } };
  }

  if (placeId) {
    customWhere.places = { some: { id: placeId } };
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
      countries: {
        select: {
          id: true,
          name: true,
          slug: true,
          type: true,
        },
      },
      regions: {
        select: {
          id: true,
          name: true,
          slug: true,
          type: true,
        },
      },
      places: {
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
      "locationId",
      "countries",
      "regions",
      "places",
      "countryIds",
      "regionIds",
      "placeIds",
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
      countries,
      countryIds,
      region,
      regionId,
      regions,
      regionIds,
      place,
      placeId,
      places,
      placeIds,
      journeys,
      stories,
      ...rest
    } = req.validated.body;

    const sanitizedBody: any = { ...rest };

    // Format Decimal price
    if (sanitizedBody.price !== undefined && sanitizedBody.price !== null && sanitizedBody.price !== "") {
      sanitizedBody.price = Number(Number(sanitizedBody.price).toFixed(2));
    }

    const isUpdate = Boolean(
      req.validated?.body?.id ||
      req.body?.id ||
      req.params?.id ||
      req.query?.id
    );

    // Helper for many-to-many location relations
    const formatLocationRelation = (items: any, fallbackSingle?: any) => {
      let ids: string[] = [];
      if (Array.isArray(items)) {
        ids = items.filter((id) => typeof id === "string" && id.trim() !== "");
      } else if (typeof fallbackSingle === "string" && fallbackSingle.trim() !== "") {
        ids = [fallbackSingle.trim()];
      }
      if (isUpdate) {
        return { set: ids.map((id) => ({ id })) };
      } else if (ids.length > 0) {
        return { connect: ids.map((id) => ({ id })) };
      }
      return undefined;
    };

    const countriesInput = countries ?? countryIds;
    if (countriesInput !== undefined || countryId !== undefined) {
      const rel = formatLocationRelation(countriesInput, countryId);
      if (rel) sanitizedBody.countries = rel;
    }

    const regionsInput = regions ?? regionIds;
    if (regionsInput !== undefined || regionId !== undefined) {
      const rel = formatLocationRelation(regionsInput, regionId);
      if (rel) sanitizedBody.regions = rel;
    }

    const placesInput = places ?? placeIds;
    if (placesInput !== undefined || placeId !== undefined) {
      const rel = formatLocationRelation(placesInput, placeId);
      if (rel) sanitizedBody.places = rel;
    }

    // Many-to-Many Journeys
    if (Array.isArray(journeys)) {
      if (isUpdate) {
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
      if (isUpdate) {
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
      countries: true,
      regions: true,
      places: true,
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
      countries: {
        select: {
          id: true,
          name: true,
          slug: true,
          type: true,
        },
      },
      regions: {
        select: {
          id: true,
          name: true,
          slug: true,
          type: true,
        },
      },
      places: {
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
