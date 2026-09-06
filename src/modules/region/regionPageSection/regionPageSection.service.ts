import prisma from "../../../config/prisma.js";

import { manageRecordWithFiles } from "../../../shared/manageRecordWithFiles.service.js";
import { deleteRecordsSafely } from "../../../shared/delete.service.js";
import { getRecords } from "../../../shared/getRecords.service.js";

export const getRegionPageSectionService = async (req: any) => {
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
    model: prisma.regionPageSection,
    customWhere,
    modelName: "regionPageSection",

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

export const manageRegionPageSectionService = async (req: any, res: any) => {
  const { pageId } = req.validated.body;

  // -------------------------
  // Validate Region Page
  // -------------------------

  if (pageId) {
    const regionPage = await prisma.regionPage.findUnique({
      where: {
        id: pageId,
      },
      include: {
        location: true,
      },
    });

    if (!regionPage) {
      throw new Error("RegionPage not found");
    }

    // RegionPage must belong to a REGION location
    if (regionPage.location.type !== "REGION") {
      throw new Error(
        `RegionPageSection can only be created for REGION location. Current type: ${regionPage.location.type}`,
      );
    }
  }

  // -------------------------
  // Manage Region Page Section
  // -------------------------

  const result = await manageRecordWithFiles({
    req,
    res,
    prisma,
    model: prisma.regionPageSection,
    modelName: "regionPageSection",
    externalDomain: ["res.cloudinary.com"],
    attachUser: false,
  });

  return result;
};

export const deleteRegionPageSectionService = async (req: any, res: any) => {
  const result = await deleteRecordsSafely({
    res,
    req,
    prisma,
    model: prisma.regionPageSection,
    modelName: "RegionPageSection",
    softDelete: true,
    rawIds: req.body.id,
    externalDomain: ["res.cloudinary.com"],
    maxLimit: 10,
    txClient: prisma,
  });

  return result;
};
