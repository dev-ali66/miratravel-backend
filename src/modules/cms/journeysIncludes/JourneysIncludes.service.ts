import { getRecords } from "../../../shared/getRecords.service.js";
import { manageRecordWithFiles } from "../../../shared/manageRecordWithFiles.service.js";
import { deleteRecordsSafely } from "../../../shared/delete.service.js";
import prisma from "../../../config/prisma.js";

export const getjourneysIncludesService = async (req: any) => {
  let result = await getRecords({
    req,
    model: prisma.journeysIncludes,
    modelName: "journeysIncludes",
  });

  return result;
};

export const managejourneysIncludesService = async (req: any, res: any) => {
  let result = await manageRecordWithFiles({
    req,
    res,
    prisma,
    model: prisma.journeysIncludes,
    modelName: "journeysIncludes",
    externalDomain: ["res.cloudinary.com"],
    attachUser: true,
  });

  return result;
};
export const deletejourneysIncludesService = async (req: any, res: any) => {
  const result = await deleteRecordsSafely({
    res,
    req,
    prisma,
    model: prisma.journeysIncludes,
    modelName: "journeysIncludes",
    rawIds: req.body.id,
    externalDomain: ["res.cloudinary.com"],
    maxLimit: 10,
    txClient: prisma,
  });
  return result;
};
