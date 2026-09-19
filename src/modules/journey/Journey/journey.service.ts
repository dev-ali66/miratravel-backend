import prisma from "../../../config/prisma.js";
import { deleteRecordsSafely } from "../../../shared/delete.service.js";
import { getRecords } from "../../../shared/getRecords.service.js";
import { manageRecordWithFiles } from "../../../shared/manageRecordWithFiles.service.js";

const journeyInclude = undefined;

const toArray = (value: unknown): string[] =>
  Array.isArray(value)
    ? value
    : typeof value === "string" && value.length
      ? value.split(",").map((v) => v.trim())
      : [];

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
      "search",
    ],
  });

  return result;
};

export const manageJourneyService = async (req: any, res: any) => {
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
