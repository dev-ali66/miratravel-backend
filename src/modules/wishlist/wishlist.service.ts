import { Request, Response } from "express";
import prisma from "../../config/prisma.js";
import { getRecords } from "../../shared/getRecords.service.js";
import { manageRecordWithFiles } from "../../shared/manageRecordWithFiles.service.js";
import { deleteRecordsSafely } from "../../shared/delete.service.js";
import ApiError from "../../utils/api.error.js";

export const getWishlistService = async (req: Request) => {
  const authId = (req as any).auth?.id;
  const query = req.validated?.query || req.query || {};

  const targetAuthId = authId || query.authId;

  const {
    sortBy,
    order,
    sortOrder,
    sort,
    journeyType,
    type,
    minPrice,
    maxPrice,
    search,
  } = query;

  // Determine sort direction (default 'desc')
  const rawOrder = (sortOrder || order || sort || "desc").toString().toLowerCase();
  const finalSortOrder: "asc" | "desc" = rawOrder === "asc" ? "asc" : "desc";

  // Determine order criteria
  let orderBy: any = { createdAt: finalSortOrder };

  if (sortBy === "price") {
    orderBy = { journey: { price: finalSortOrder } };
  } else if (sortBy === "journeyCreatedAt") {
    orderBy = { journey: { createdAt: finalSortOrder } };
  } else if (sortBy === "createdAt" || sortBy === "time" || sortBy === "date") {
    orderBy = { createdAt: finalSortOrder };
  }

  // Build customWhere for journey filter conditions
  const customWhere: any = {};
  const journeyWhere: any = {};

  // journeyType filtering
  const targetType = journeyType || type;
  if (targetType) {
    let typesArray: string[] = [];
    if (Array.isArray(targetType)) {
      typesArray = targetType
        .flatMap((t) => String(t).split(","))
        .map((t) => t.trim().toUpperCase());
    } else if (typeof targetType === "string") {
      typesArray = targetType
        .split(",")
        .map((t) => t.trim().toUpperCase());
    }
    typesArray = typesArray.filter(Boolean);
    if (typesArray.length > 0) {
      journeyWhere.journeyType = {
        hasSome: typesArray,
      };
    }
  }

  // Price range filtering
  if (minPrice !== undefined || maxPrice !== undefined) {
    journeyWhere.price = {};
    if (minPrice !== undefined && minPrice !== null && minPrice !== "") {
      journeyWhere.price.gte = Number(minPrice);
    }
    if (maxPrice !== undefined && maxPrice !== null && maxPrice !== "") {
      journeyWhere.price.lte = Number(maxPrice);
    }
  }

  // Search filtering
  if (search && typeof search === "string" && search.trim() !== "") {
    journeyWhere.OR = [
      { title: { contains: search.trim(), mode: "insensitive" } },
      { subtitle: { contains: search.trim(), mode: "insensitive" } },
    ];
  }

  if (Object.keys(journeyWhere).length > 0) {
    customWhere.journey = journeyWhere;
  }

  const result = await getRecords({
    req,
    model: prisma.wishlist,
    modelName: "Wishlist",
    dbField: "authId",
    ownerField: targetAuthId,
    orderBy,
    customWhere,
    include: {
      journey: true,
    },
    excludeFilterKeys: [
      "authId",
      "sortBy",
      "sort_by",
      "order",
      "sortOrder",
      "sort",
      "orderBy",
      "journeyType",
      "type",
      "minPrice",
      "maxPrice",
      "search",
    ],
    singleRecordAsArray: true,
    audit: false,
  });

  return result;
};

export const manageWishlistService = async (req: Request, res: Response) => {
 return await manageRecordWithFiles({
    req,
    res,
    prisma,
    model: prisma.wishlist,
    modelName: "Wishlist",
    externalDomain: ["res.cloudinary.com"],
    attachUser: true,
    dbField: "authId",
  });

  // const authId = (req as any).auth?.id;
  // if (!authId) {
  //   throw new ApiError("Authentication required", 401);
  // }

  // const { journeyId, journeyIds, actionType = "TOGGLE" } = req.body;

  // // Handle batch array if journeyIds passed
  // if (Array.isArray(journeyIds) && journeyIds.length > 0) {
  //   const createdItems = [];
  //   for (const jId of journeyIds) {
  //     const existing = await (prisma as any).wishlist.findUnique({
  //       where: {
  //         authId_journeyId: { authId, journeyId: jId },
  //       },
  //     });
  //     if (!existing) {
  //       const item = await (prisma as any).wishlist.create({
  //         data: {
  //           authId,
  //           journeyId: jId,
  //           createdBy: authId,
  //         },
  //         include: { journey: true },
  //       });
  //       createdItems.push(item);
  //     }
  //   }
  //   return { data: createdItems, message: "Wishlist updated successfully" };
  // }

  // if (!journeyId) {
  //   throw new ApiError("journeyId is required", 400);
  // }

  // const existing = await (prisma as any).wishlist.findUnique({
  //   where: {
  //     authId_journeyId: {
  //       authId,
  //       journeyId,
  //     },
  //   },
  // });

  // if (actionType === "REMOVE" || (actionType === "TOGGLE" && existing)) {
  //   if (existing) {
  //     await (prisma as any).wishlist.delete({
  //       where: { id: existing.id },
  //     });
  //     return { data: null, message: "Journey removed from wishlist" };
  //   }
  //   return { data: null, message: "Item not in wishlist" };
  // }

  // if (!existing) {
  //   req.body = {
  //     authId,
  //     journeyId,
  //     createdBy: authId,
  //   };

  //   const result = await manageRecordWithFiles({
  //     req,
  //     res,
  //     prisma,
  //     model: (prisma as any).wishlist,
  //     modelName: "Wishlist",
  //     dbField: "authId",
  //     ownerField: authId,
  //     include: { journey: true },
  //     attachUser: true,
  //     audit: false,
  //   });

  //   return result;
  // }

  // return { data: existing, message: "Journey already in wishlist" };
};

export const deleteWishlistService = async (req: Request, res: Response) => {
  return await deleteRecordsSafely({
    req,
    prisma,
    model: prisma.wishlist,
    modelName: "Wishlist",
    rawIds: req.query.id || req.body?.id,
    dbField: "authId",
    audit: false,
    softDelete: false
  });
};
