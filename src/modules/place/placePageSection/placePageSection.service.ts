import prisma from "../../../config/prisma.js";

import { manageRecordWithFiles } from "../../../shared/manageRecordWithFiles.service.js";
import { deleteRecordsSafely } from "../../../shared/delete.service.js";
import { getRecords } from "../../../shared/getRecords.service.js";

export const getPlacePageSectionService = async (req: any) => {
  const { id, pageId, name, slug, search } = req.query;

  const customWhere: any = {};

  // -------------------------
  // ID - Exact Match
  // -------------------------

  if (id) {
    customWhere.id = id;
  }

  // -------------------------
  // Page ID - Exact Match
  // -------------------------

  if (pageId) {
    customWhere.pageId = pageId;
  }

  // -------------------------
  // Name - Partial Match
  // -------------------------

  if (name) {
    customWhere.name = {
      contains: name,
      mode: "insensitive",
    };
  }

  // -------------------------
  // Slug - Exact Match
  // -------------------------

  if (slug) {
    customWhere.slug = slug;
  }

  // -------------------------
  // Global Search
  // Search Name / Slug
  // -------------------------

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

  // -------------------------
  // Get Records
  // -------------------------

  const result = await getRecords({
    req,
    model: prisma.placePageSection,
    customWhere,
    modelName: "PlacePageSection",

    include: {
      page: {
        include: {
          location: true,
        },
      },
    },
  });

  return result;
};

export const managePlacePageSectionService = async (req: any, res: any) => {
  const { pageId } = req.validated.body;

  // -------------------------
  // Validate Place Page
  // -------------------------

  if (pageId) {
    const placePage = await prisma.placePage.findUnique({
      where: {
        id: pageId,
      },
      include: {
        location: true,
      },
    });

    if (!placePage) {
      throw new Error("PlacePage not found");
    }

    // PlacePage must belong to a PLACE location
    if (placePage.location.type !== "PLACE") {
      throw new Error(
        `PlacePageSection can only be created for PLACE location. Current type: ${placePage.location.type}`,
      );
    }
  }

  // -------------------------
  // Manage Place Page Section
  // -------------------------

  const result = await manageRecordWithFiles({
    req,
    res,
    prisma,
    model: prisma.placePageSection,
    modelName: "placePageSection",
    externalDomain: ["res.cloudinary.com"],
    attachUser: false,
  });

  return result;
};

export const deletePlacePageSectionService = async (req: any, res: any) => {
  const result = await deleteRecordsSafely({
    res,
    req,
    prisma,
    model: prisma.placePageSection,
    modelName: "PlacePageSection",
    softDelete: true,
    rawIds: req.body.id,
    externalDomain: ["res.cloudinary.com"],
    maxLimit: 10,
    txClient: prisma,
  });

  return result;
};
