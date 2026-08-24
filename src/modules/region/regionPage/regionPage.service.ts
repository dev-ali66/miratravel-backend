import prisma from "../../../config/prisma.js";

import { manageRecordWithFiles } from "../../../shared/manageRecordWithFiles.service.js";
import { deleteRecordsSafely } from "../../../shared/delete.service.js";
import { getRecords } from "../../../shared/getRecords.service.js";

export const getRegionPageService = async (req: any) => {
  const { id, locationId, name, slug, search } = req.query;

  const customWhere: any = {};

  // -------------------------
  // ID - Exact Match
  // -------------------------

  if (id) {
    customWhere.id = id;
  }

  // -------------------------
  // Location ID - Exact Match
  // -------------------------

  if (locationId) {
    customWhere.locationId = locationId;
  }

  // -------------------------
  // Location Name - Partial Match
  // -------------------------

  if (name) {
    customWhere.location = {
      ...(customWhere.location || {}),
      name: {
        contains: name,
        mode: "insensitive",
      },
    };
  }

  // -------------------------
  // Location Slug - Exact Match
  // -------------------------

  if (slug) {
    customWhere.location = {
      ...(customWhere.location || {}),
      slug,
    };
  }

  // -------------------------
  // Global Search
  // Search Location Name / Slug
  // -------------------------

  if (search) {
    const tokens: string[] = [
      ...new Set((search as string).trim().split(/\s+/)),
    ];

    customWhere.OR = tokens.map((token) => ({
      location: {
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
      },
    }));
  }

  // -------------------------
  // Get Records
  // -------------------------

  const result = await getRecords({
    req,
    model: prisma.regionPage,
    customWhere,
    modelName: "RegionPage",

    include: {
      location: true,

      sections: {
        orderBy: {
          order: "asc",
        },
      },
    },
  });

  return result;
};

export const manageRegionPageService = async (req: any, res: any) => {
  const { locationId } = req.validated.body;

  // -------------------------
  // Validate Location
  // -------------------------

  if (locationId) {
    const location = await prisma.location.findUnique({
      where: {
        id: locationId,
      },
    });

    if (!location) {
      throw new Error("Location not found");
    }

    // RegionPage only for REGION locations
    if (location.type !== "REGION") {
      throw new Error(
        `RegionPage can only be created for REGION location. Current type: ${location.type}`,
      );
    }
  }

  // -------------------------
  // Manage Region Page
  // -------------------------

  const result = await manageRecordWithFiles({
    req,
    res,
    prisma,
    model: prisma.regionPage,
    modelName: "regionPage",
    externalDomain: ["res.cloudinary.com"],
    attachUser: false,
  });

  return result;
};

export const deleteRegionPageService = async (req: any, res: any) => {
  const result = await deleteRecordsSafely({
    res,
    req,
    prisma,
    model: prisma.regionPage,
    modelName: "regionPage",
    rawIds: req.body.id,
    externalDomain: ["res.cloudinary.com"],
    maxLimit: 10,
    txClient: prisma,
  });

  return result;
};