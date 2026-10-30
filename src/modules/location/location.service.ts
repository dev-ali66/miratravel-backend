import { manageRecordWithFiles } from "../../shared/manageRecordWithFiles.service.js";
import { deleteRecordsSafely } from "../../shared/delete.service.js";
import prisma from "../../config/prisma.js";
import { getRecords } from "../../shared/getRecords.service.js";
import { LocationType } from "@prisma/client";

export const getLocationService = async (req: any) => {
  const { name, slug, type, search, featured, parentId } = req.query;

  const customWhere: any = {};

  // -------------------------
  // Existing Filters
  // -------------------------

  // Parent ID
  if (parentId) {
    customWhere.parentId = parentId;
  }

  // Featured Filter - boolean match
  if (featured !== undefined && featured !== null && featured !== "") {
    customWhere.featured = String(featured).toLowerCase() === "true";
  }

  // Location Name - Partial Match
  if (name) {
    customWhere.name = {
      contains: name,
      mode: "insensitive",
    };
  }

  // Location Slug - Exact Match
  if (slug) {
    customWhere.slug = slug;
  }

  // Location Type - Exact Match
  if (type) {
    const allowedTypes = Object.values(LocationType);

    if (!allowedTypes.includes(type as LocationType)) {
      throw new Error(`Invalid type: allowed only ${allowedTypes.join("/  ")}`);
    }

    customWhere.type = type;
  }
  // -------------------------
  // Global Search
  // -------------------------

  if (search) {
    const tokens: string[] = [
      ...new Set((search as string).trim().split(/\s+/)),
    ];

    type EnumMap<T extends string> = {
      values: readonly T[];
      buildCondition: (value: T) => any;
    };

    const enumMaps: EnumMap<any>[] = [
      {
        values: Object.values(LocationType),
        buildCondition: (value: LocationType) => ({
          type: value,
        }),
      },

      // Future enum search:
      // {
      //   values: Object.values(AnotherEnum),
      //   buildCondition: (value: AnotherEnum) => ({
      //     anotherField: value,
      //   }),
      // },
    ];

    customWhere.OR = tokens.map((token) => {
      const upperToken = token.toUpperCase();

      const orConditions: any[] = [
        // -------------------------
        // Location Name
        // -------------------------
        {
          name: {
            contains: token,
            mode: "insensitive",
          },
        },

        // -------------------------
        // Location Slug
        // -------------------------
        {
          slug: {
            contains: token,
            mode: "insensitive",
          },
        },
      ];

      // -------------------------
      // Dynamic Enum Search
      // -------------------------

      for (const enumMap of enumMaps) {
        if (enumMap.values.includes(upperToken as any)) {
          orConditions.push(enumMap.buildCondition(upperToken as any));
        }
      }

      return {
        OR: orConditions,
      };
    });
  }

  // -------------------------
  // Get Records
  // -------------------------

  const result = await getRecords({
    req,
    model: prisma.location,
    customWhere,
    modelName: "Location",
    include: {
      parent: true,
      children: {
        select: {
          id: true,
          name: true,
          slug: true,
          type: true,
          featured: true,
          hero: true,
          card: true,
          essence: true,
          why: true,
          parent: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
      },
      journeys: {
        select: {
          id: true,
          title: true,
          slug: true,
          status: true,
          featured: true,
          price: true,
          minDays: true,
          maxDays: true,
          pace: true,
          comfortLevel: true,
          hero: true,
        },
      },
      countryExperiences: {
        select: {
          id: true,
          name: true,
          slug: true,
          primaryType: true,
          featured: true,
          price: true,
          hero: true,
        },
      },
      regionExperienceList: {
        select: {
          id: true,
          name: true,
          slug: true,
          primaryType: true,
          featured: true,
          price: true,
          hero: true,
        },
      },
      placeExperiences: {
        select: {
          id: true,
          name: true,
          slug: true,
          primaryType: true,
          featured: true,
          price: true,
          hero: true,
        },
      },
    },
  });

  return result;
};

export const manageLocationService = async (req: any, res: any) => {
  if (req.validated?.body) {
    const {
      parent,
      children,
      parentId,
      experience,
      countryExperiences,
      regionExperienceList,
      placeExperiences,
      ...rest
    } = req.validated.body;

    const sanitizedBody: any = { ...rest };

    const isUpdate = Boolean(
      req.validated?.body?.id ||
      req.body?.id ||
      req.params?.id ||
      req.query?.id
    );

    // Handle Prisma relation for parent location
    if (parentId && typeof parentId === "string" && parentId.trim() !== "") {
      sanitizedBody.parent = {
        connect: { id: parentId.trim() },
      };
    } else if (isUpdate && (parentId === null || parentId === "")) {
      sanitizedBody.parent = {
        disconnect: true,
      };
    }

    const formatExperienceRelation = (ids: any) => {
      if (!Array.isArray(ids)) return undefined;
      const validIds = ids.filter((id) => typeof id === "string" && id.trim() !== "");
      if (isUpdate) {
        return { set: validIds.map((id: string) => ({ id })) };
      } else if (validIds.length > 0) {
        return { connect: validIds.map((id: string) => ({ id })) };
      }
      return undefined;
    };

    if (countryExperiences !== undefined) {
      const rel = formatExperienceRelation(countryExperiences);
      if (rel) sanitizedBody.countryExperiences = rel;
    }

    if (regionExperienceList !== undefined) {
      const rel = formatExperienceRelation(regionExperienceList);
      if (rel) sanitizedBody.regionExperienceList = rel;
    }

    if (placeExperiences !== undefined) {
      const rel = formatExperienceRelation(placeExperiences);
      if (rel) sanitizedBody.placeExperiences = rel;
    }

    req.validated.body = sanitizedBody;
  }

  const result = await manageRecordWithFiles({
    req,
    res,
    prisma,
    model: prisma.location,
    modelName: "location",
    externalDomain: ["res.cloudinary.com"],
    attachUser: false,
    include: {
      parent: true,
      children: true,
      countryExperiences: true,
      regionExperienceList: true,
      placeExperiences: true,
    },
  });

  return result;
};

export const deleteLocationService = async (req: any, res: any) => {
  const result = await deleteRecordsSafely({
    res,
    req,
    prisma,
    model: prisma.location,
    modelName: "location",
    softDelete: false,
    rawIds: req.body.id,
    externalDomain: ["res.cloudinary.com"],
    maxLimit: 10,
    txClient: prisma,
  });

  return result;
};

export const searchLocationOptionsService = async (req: any) => {
  const { search, limit = 50, type, featured } = req.query;
  const where: any = {
    deletedAt: null,
  };

  if (type) {
    where.type = type;
  }

  if (featured !== undefined && featured !== null && featured !== "") {
    where.featured = String(featured).toLowerCase() === "true";
  }

  if (search && typeof search === "string" && search.trim()) {
    const trimmed = search.trim();
    where.OR = [
      { name: { contains: trimmed, mode: "insensitive" } },
      { slug: { contains: trimmed, mode: "insensitive" } },
    ];
  }

  const locations = await prisma.location.findMany({
    where,
    select: {
      id: true,
      name: true,
      slug: true,
      type: true,
      featured: true,
      hero: true,
      card: true,
      why: true,
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
    data: locations,
    message: "Location search options fetched successfully",
  };
};

