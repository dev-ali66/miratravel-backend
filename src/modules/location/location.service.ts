import { manageRecordWithFiles } from "../../shared/manageRecordWithFiles.service.js";
import { deleteRecordsSafely } from "../../shared/delete.service.js";
import prisma from "../../config/prisma.js";
import { getRecords } from "../../shared/getRecords.service.js";
import { LocationType } from "@prisma/client";

export const getLocationService = async (req: any) => {
  const { name, slug, type, search } = req.query;

  const customWhere: any = {};

  // -------------------------
  // Existing Filters
  // -------------------------

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
      throw new Error(
        `Invalid type: allowed only ${allowedTypes.join("/  ")}`
      );
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
      children: true,
    },
  });

  return result;
};

export const manageLocationService = async (req: any, res: any) => {
  const result = await manageRecordWithFiles({
    req,
    res,
    prisma,
    model: prisma.location,
    modelName: "location",
    externalDomain: ["res.cloudinary.com"],
    attachUser: false,
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
    rawIds: req.body.id,
    externalDomain: ["res.cloudinary.com"],
    maxLimit: 10,
    txClient: prisma,
  });

  return result;
};