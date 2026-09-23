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
    include: {
      journey: true,
    },
    singleRecordAsArray: true,
    audit: false,
  });

  return result;
};

export const manageWishlistService = async (req: Request, res: Response) => {
  const authId = (req as any).auth?.id;
  if (!authId) {
    throw new ApiError("Authentication required", 401);
  }

  const { journeyId, journeyIds, actionType = "TOGGLE" } = req.body;

  // Handle batch array if journeyIds passed
  if (Array.isArray(journeyIds) && journeyIds.length > 0) {
    const createdItems = [];
    for (const jId of journeyIds) {
      const existing = await (prisma as any).wishlist.findUnique({
        where: {
          authId_journeyId: { authId, journeyId: jId },
        },
      });
      if (!existing) {
        const item = await (prisma as any).wishlist.create({
          data: {
            authId,
            journeyId: jId,
            createdBy: authId,
          },
          include: { journey: true },
        });
        createdItems.push(item);
      }
    }
    return { data: createdItems, message: "Wishlist updated successfully" };
  }

  if (!journeyId) {
    throw new ApiError("journeyId is required", 400);
  }

  const existing = await (prisma as any).wishlist.findUnique({
    where: {
      authId_journeyId: {
        authId,
        journeyId,
      },
    },
  });

  if (actionType === "REMOVE" || (actionType === "TOGGLE" && existing)) {
    if (existing) {
      await (prisma as any).wishlist.delete({
        where: { id: existing.id },
      });
      return { data: null, message: "Journey removed from wishlist" };
    }
    return { data: null, message: "Item not in wishlist" };
  }

  if (!existing) {
    req.body = {
      authId,
      journeyId,
      createdBy: authId,
    };

    const result = await manageRecordWithFiles({
      req,
      res,
      prisma,
      model: (prisma as any).wishlist,
      modelName: "Wishlist",
      dbField: "authId",
      ownerField: authId,
      include: { journey: true },
      attachUser: true,
      audit: false,
    });

    return result;
  }

  return { data: existing, message: "Journey already in wishlist" };
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
