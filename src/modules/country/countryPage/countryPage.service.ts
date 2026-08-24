import prisma from "../../../config/prisma.js";

import { manageRecordWithFiles } from "../../../shared/manageRecordWithFiles.service.js";
import { deleteRecordsSafely } from "../../../shared/delete.service.js";
import { getRecords } from "../../../shared/getRecords.service.js";

export const getCountryPageService = async (req: any) => {
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
    model: prisma.countryPage,
    customWhere,
    modelName: "CountryPage",

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


export const manageCountryPageService = async (req: any, res: any) => {
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

    // CountryPage only for COUNTRY locations
    if (location.type !== "COUNTRY") {
      throw new Error(
        `CountryPage can only be created for COUNTRY location. Current type: ${location.type}`,
      );
    }
  }

  // -------------------------
  // Manage Country Page
  // -------------------------

  const result = await manageRecordWithFiles({
    req,
    res,
    prisma,
    model: prisma.countryPage,
    modelName: "countryPage",
    externalDomain: ["res.cloudinary.com"],
    attachUser: false,
  });

  return result;
};

export const deleteCountryPageService = async (req: any, res: any) => {
  const result = await deleteRecordsSafely({
    res,
    req,
    prisma,
    model: prisma.countryPage,
    modelName: "countryPage",
    rawIds: req.body.id,
    externalDomain: ["res.cloudinary.com"],
    maxLimit: 10,
    txClient: prisma,
  });

  return result;
};