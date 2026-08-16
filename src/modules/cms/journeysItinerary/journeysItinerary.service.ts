import { getRecords } from "../../../shared/getRecords.service.js";
import { manageRecordWithFiles } from "../../../shared/manageRecordWithFiles.service.js";
import { deleteRecordsSafely } from "../../../shared/delete.service.js";
import prisma from "../../../config/prisma.js";

export const getjourneysItineraryService = async (req: any) => {
  let result = await getRecords({
    req,
    model: prisma.journeysItinerary,
    modelName: "journeysItinerary",
  });

  return result;
};

export const managejourneysItineraryService = async (req: any, res: any) => {
  let result = await manageRecordWithFiles({
    req,
    res,
    prisma,
    model: prisma.journeysItinerary,
    modelName: "journeysItinerary",
    externalDomain: ["res.cloudinary.com"],
    attachUser: true,
  });

  return result;
};
export const deletejourneysItineraryService = async (req: any, res: any) => {
  const result = await deleteRecordsSafely({
    res,
    req,
    prisma,
    model: prisma.journeysItinerary,
    modelName: "journeysItinerary",
    rawIds: req.body.id,
    externalDomain: ["res.cloudinary.com"],
    maxLimit: 10,
    txClient: prisma,
  });
  return result;
};
