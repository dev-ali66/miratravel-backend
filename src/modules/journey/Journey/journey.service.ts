import prisma from "../../../config/prisma.js";
import { deleteRecordsSafely } from "../../../shared/delete.service.js";
import { getRecords } from "../../../shared/getRecords.service.js";
import { manageRecordWithFiles } from "../../../shared/manageRecordWithFiles.service.js";

const journeyInclude = {
  locations: {
    select: {
      id: true,
      name: true,
      slug: true,
      type: true,
      featured: true,
      hero: true,
      card: true,
    },
  },
};

const toArray = (value: unknown): string[] =>
  Array.isArray(value)
    ? value
    : typeof value === "string" && value.length
      ? value.split(",").map((v) => v.trim())
      : [];

const extractLocationIds = (body: any): string[] => {
  const idsSet = new Set<string>();

  const processValue = (val: any) => {
    if (!val) return;

    if (typeof val === "string") {
      const trimmed = val.trim();
      if (trimmed.length > 0) {
        idsSet.add(trimmed);
      }
    } else if (Array.isArray(val)) {
      val.forEach((item) => {
        if (typeof item === "string") {
          const trimmed = item.trim();
          if (trimmed.length > 0) idsSet.add(trimmed);
        } else if (item && typeof item === "object") {
          processValue(item);
        }
      });
    } else if (typeof val === "object") {
      if (typeof val.locationId === "string" && val.locationId.trim()) {
        idsSet.add(val.locationId.trim());
      }
      if (typeof val.location_id === "string" && val.location_id.trim()) {
        idsSet.add(val.location_id.trim());
      }
      if (val.location) {
        if (typeof val.location === "string" && val.location.trim()) {
          idsSet.add(val.location.trim());
        } else if (typeof val.location === "object" && val.location.id) {
          idsSet.add(String(val.location.id).trim());
        }
      }
      if (val.locations) {
        processValue(val.locations);
      }

      for (const key of Object.keys(val)) {
        if (
          [
            "itinerary",
            "itineraryItems",
            "items",
            "destinations",
            "destinationStays",
            "days",
            "steps",
          ].includes(key)
        ) {
          processValue(val[key]);
        }
      }
    }
  };

  // 1. Explicit locations passed in body
  if (body.locations !== undefined) {
    if (Array.isArray(body.locations)) {
      body.locations.forEach((item: any) => {
        if (typeof item === "string" && item.trim()) idsSet.add(item.trim());
        else if (item && typeof item === "object" && item.id)
          idsSet.add(String(item.id).trim());
      });
    } else if (typeof body.locations === "string") {
      body.locations.split(",").forEach((s: string) => {
        if (s.trim()) idsSet.add(s.trim());
      });
    }
  }

  // 2. Extracted from itinerary or accommodations or overview if present
  if (body.itinerary) {
    processValue(body.itinerary);
  }
  if (body.accommodations) {
    processValue(body.accommodations);
  }
  if (body.overview) {
    processValue(body.overview);
  }

  return Array.from(idsSet);
};

export const getJourneyService = async (req: any) => {
  const {
    id,
    slug,
    status,
    featured,
    journeyType,
    travelStyle,
    perfectFor,
    pace,
    comfortLevel,
    minPrice,
    maxPrice,
    minDays,
    maxDays,
    locationId,
    locationSlug,
    search,
  } = req.validated.query;

  const customWhere: any = {};

  // -------------------------
  // Exact matches
  // -------------------------

  if (id) customWhere.id = id;
  if (slug) customWhere.slug = slug;
  if (status) customWhere.status = status;
  if (featured !== undefined) customWhere.featured = featured === "true";
  if (pace) customWhere.pace = pace;
  if (comfortLevel) customWhere.comfortLevel = comfortLevel;

  // -------------------------
  // Relation filtering
  // -------------------------

  if (locationId) {
    customWhere.locations = {
      some: { id: locationId },
    };
  }

  if (locationSlug) {
    customWhere.locations = {
      some: { slug: locationSlug },
    };
  }

  // -------------------------
  // Multi-select filters (hasSome)
  // -------------------------

  const journeyTypeArr = toArray(journeyType);
  if (journeyTypeArr.length)
    customWhere.journeyType = { hasSome: journeyTypeArr };

  const travelStyleArr = toArray(travelStyle);
  if (travelStyleArr.length)
    customWhere.travelStyle = { hasSome: travelStyleArr };

  const perfectForArr = toArray(perfectFor);
  if (perfectForArr.length) customWhere.perfectFor = { hasSome: perfectForArr };

  // -------------------------
  // Price range
  // -------------------------

  if (minPrice || maxPrice) {
    customWhere.price = {};
    if (minPrice) customWhere.price.gte = Number(minPrice);
    if (maxPrice) customWhere.price.lte = Number(maxPrice);
  }

  // -------------------------
  // Duration overlap
  // -------------------------

  if (minDays || maxDays) {
    customWhere.AND = customWhere.AND || [];
    if (maxDays) customWhere.AND.push({ minDays: { lte: Number(maxDays) } });
    if (minDays) customWhere.AND.push({ maxDays: { gte: Number(minDays) } });
  }

  // -------------------------
  // Global search
  // -------------------------

  if (search) {
    const tokens: string[] = [
      ...new Set((search as string).trim().split(/\s+/)),
    ];

    customWhere.OR = tokens.map((token) => ({
      OR: [
        { title: { contains: token, mode: "insensitive" } },
        { subtitle: { contains: token, mode: "insensitive" } },
        { slug: { contains: token, mode: "insensitive" } },
      ],
    }));
  }

  const result = await getRecords({
    req,
    model: prisma.journey,
    customWhere,
    modelName: "Journey",
    include: journeyInclude,
    excludeFilterKeys: [
      "page",
      "limit",
      "id",
      "slug",
      "status",
      "featured",
      "journeyType",
      "travelStyle",
      "perfectFor",
      "pace",
      "comfortLevel",
      "minPrice",
      "maxPrice",
      "minDays",
      "maxDays",
      "locationId",
      "locationSlug",
      "search",
    ],
  });

  return result;
};

export const manageJourneyService = async (req: any, res: any) => {
  if (req.validated?.body) {
    const body = req.validated.body;
    const hasLocationField =
      "locations" in body ||
      "itinerary" in body ||
      "accommodations" in body;

    if (hasLocationField) {
      const candidateIds = extractLocationIds(body);
      let validLocationIds: string[] = [];

      if (candidateIds.length > 0) {
        const existingLocations = await prisma.location.findMany({
          where: { id: { in: candidateIds }, deletedAt: null },
          select: { id: true },
        });
        validLocationIds = existingLocations.map((loc) => loc.id);
      }

      const sanitizedBody = { ...body };

      sanitizedBody.locations = {
        set: validLocationIds.map((id) => ({ id })),
      };

      req.validated.body = sanitizedBody;
    }
  }

  const result = await manageRecordWithFiles({
    req,
    res,
    prisma,
    model: prisma.journey,
    modelName: "journey",
    include: journeyInclude,
    externalDomain: ["res.cloudinary.com"],
    attachUser: false,
  });

  return result;
};

export const deleteJourneyService = async (req: any, res: any) => {
  const result = await deleteRecordsSafely({
    res,
    req,
    prisma,
    model: prisma.journey,
    modelName: "journey",
    softDelete: true,
    rawIds: req.body.id,
    externalDomain: ["res.cloudinary.com"],
    maxLimit: 10,
    txClient: prisma,
  });

  return result;
};
