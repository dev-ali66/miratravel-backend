import { deleteRecordsSafely } from "../../shared/delete.service.js";
import { getRecords } from "../../shared/getRecords.service.js";
import { manageRecordWithFiles } from "../../shared/manageRecordWithFiles.service.js";
import prisma from "../../config/prisma.js";

export const getWishlistService = async (req: any) => {
  let result = await getRecords({
    req,
    model: prisma.wishlist,
    modelName: "Wishlist",
    limitDefault: 10000,
    dbField: "authId",
    ownerField: req.auth.id,
  });
  return result;
};

export const manageWishlistService = async (req: any, res: any) => {
  let result = await manageRecordWithFiles({
    req,
    res,
    prisma,
    model: prisma.wishlist,
    modelName: "Wishlist",
    externalDomain: ["res.cloudinary.com"],
    attachUser: true,
    dbField: "authId",
    ownerField: req.auth.id,
  });

  return result;
};

export const deleteWishlistService = async (req: any, res: any) => {
  const result = await deleteRecordsSafely({
    res,
    req,
    prisma,
    model: prisma.wishlist,
    modelName: "Wishlist",
    rawIds: req.body.id,
    externalDomain: ["res.cloudinary.com"],
    maxLimit: 10,
    txClient: prisma,
    dbField: "authId",
    ownerField: req.auth.id,
  });
  return result;
};
