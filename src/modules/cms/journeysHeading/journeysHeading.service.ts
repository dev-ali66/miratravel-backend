import { getRecords } from "../../../shared/getRecords.service.js";
import { manageRecordWithFiles } from "../../../shared/manageRecordWithFiles.service.js";
import { deleteRecordsSafely } from "../../../shared/delete.service.js";
import prisma from "../../../config/prisma.js";

export const getjourneysHeadingService = async (req: any) => {
  let result = await getRecords({
    req,
    model: prisma.journeysHeading,
    modelName: "journeysHeading",
  });

  return result;
};

export const managejourneysHeadingService = async (req: any, res: any) => {
  let result = await manageRecordWithFiles({
    req,
    res,
    prisma,
    model: prisma.journeysHeading,
    modelName: "journeysHeading",
    externalDomain: ["res.cloudinary.com"],
    attachUser: true,
  });

  return result;
};
export const deletejourneysHeadingService = async (req: any, res: any) => {
  const result = await deleteRecordsSafely({
    res,
    req,
    prisma,
    model: prisma.journeysHeading,
    modelName: "journeysHeading",
    rawIds: req.body.id,
    externalDomain: ["res.cloudinary.com"],
    maxLimit: 10,
    txClient: prisma,
  });
  return result;
};
