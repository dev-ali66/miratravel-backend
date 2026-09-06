import prisma from "../../../config/prisma.js";

import { manageRecordWithFiles } from "../../../shared/manageRecordWithFiles.service.js";
import { deleteRecordsSafely } from "../../../shared/delete.service.js";
import { getRecords } from "../../../shared/getRecords.service.js";

export const getCountryPageSectionService = async (req: any) => {
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
    model: prisma.countryPageSection,
    customWhere,
    modelName: "CountryPageSection",

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

export const manageCountryPageSectionService = async (req: any, res: any) => {
  const { pageId } = req.validated.body;

  // -------------------------
  // Validate Country Page
  // -------------------------

  if (pageId) {
    const countryPage = await prisma.countryPage.findUnique({
      where: {
        id: pageId,
      },
      include: {
        location: true,
      },
    });

    if (!countryPage) {
      throw new Error("CountryPage not found");
    }

    // CountryPage must belong to a COUNTRY location
    if (countryPage.location.type !== "COUNTRY") {
      throw new Error(
        `CountryPageSection can only be created for COUNTRY location. Current type: ${countryPage.location.type}`,
      );
    }
  }

  // -------------------------
  // Manage Country Page Section
  // -------------------------

  const result = await manageRecordWithFiles({
    req,
    res,
    prisma,
    model: prisma.countryPageSection,
    modelName: "countryPageSection",
    externalDomain: ["res.cloudinary.com"],
    attachUser: false,
  });

  return result;
};

export const deleteCountryPageSectionService = async (req: any, res: any) => {
  const result = await deleteRecordsSafely({
    res,
    req,
    prisma,
    model: prisma.countryPageSection,
    modelName: "countryPageSection",
    softDelete: true,
    rawIds: req.body.id,
    externalDomain: ["res.cloudinary.com"],
    maxLimit: 10,
    txClient: prisma,
  });

  return result;
};
