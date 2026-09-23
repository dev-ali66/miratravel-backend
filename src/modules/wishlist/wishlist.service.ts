import { Request, Response } from "express";
import prisma from "../../config/prisma.js";
import { getRecords } from "../../shared/getRecords.service.js";
import { manageRecordWithFiles } from "../../shared/manageRecordWithFiles.service.js";
import { deleteRecordsSafely } from "../../shared/delete.service.js";
import ApiError from "../../utils/api.error.js";

export const getWishlistService = async (req: Request) => {
  const authId = (req as any).auth?.id;
  const targetAuthId = authId || req.query.authId;

  const result = await getRecords({
    req,
    model: (prisma as any).wishlist,
    modelName: "Wishlist",
    dbField: "authId",
    ownerField: targetAuthId,
    singleRecordAsArray: false,
    audit: false,
  });

  // Hydrate full Journey details for returned journeyIds if requested
  if (result?.data) {
    const records = Array.isArray(result.data) ? result.data : [result.data];
    for (const rec of records) {
      if (rec.journeyIds && Array.isArray(rec.journeyIds) && rec.journeyIds.length > 0) {
        rec.journeys = await (prisma as any).journey.findMany({
          where: { id: { in: rec.journeyIds } },
        });
      } else {
        rec.journeys = [];
      }
    }
  }

  return result;
};

export const manageWishlistService = async (req: Request, res: Response) => {
  const authId = (req as any).auth?.id;
  if (!authId) {
    throw new ApiError("Authentication required", 401);
  }

  const { journeyId, journeyIds, actionType = "ADD" } = req.body;

  let existing = await (prisma as any).wishlist.findUnique({
    where: { authId },
  });

  let currentIds: string[] = existing?.journeyIds || [];

  if (actionType === "ADD" && journeyId) {
    if (!currentIds.includes(journeyId)) {
      currentIds = [...currentIds, journeyId];
    }
  } else if (actionType === "REMOVE" && journeyId) {
    currentIds = currentIds.filter((id) => id !== journeyId);
  } else if (actionType === "SET" && Array.isArray(journeyIds)) {
    currentIds = journeyIds;
  }

  req.body = {
    ...(existing?.id ? { id: existing.id } : {}),
    authId,
    journeyIds: currentIds,
  };

  const result = await manageRecordWithFiles({
    req,
    res,
    prisma,
    model: (prisma as any).wishlist,
    modelName: "Wishlist",
    dbField: "authId",
    ownerField: authId,
    attachUser: true,
    audit: false,
  });

  return result;
};

export const deleteWishlistService = async (req: Request, res: Response) => {
  const rawIds = req.query.id || req.body?.id;
  return await deleteRecordsSafely({
    req,
    prisma,
    model: (prisma as any).wishlist,
    modelName: "Wishlist",
    rawIds,
    dbField: "authId",
    audit: false,
  });
};
