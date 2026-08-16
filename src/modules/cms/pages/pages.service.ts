import { getRecords } from "../../../shared/getRecords.service.js";
import { manageRecordWithFiles } from "../../../shared/manageRecordWithFiles.service.js";
import { deleteRecordsSafely } from "../../../shared/delete.service.js";
import prisma from "../../../config/prisma.js";

export const getPagesService = async (req: any) => {
  let result = await getRecords({
    req,
    model: prisma.pages,
    include: {
      pagesSections: {},
    },
    modelName: "Pages",
  });

  return result;
};

export const managePagesService = async (req: any, res: any) => {
  let result = await manageRecordWithFiles({
    req,
    res,
    prisma,
    model: prisma.pages,
    modelName: "Pages",
    externalDomain: ["res.cloudinary.com"],
    attachUser: true,
  });

  return result;
};
export const deletePagesService = async (req: any, res: any) => {
  const result = await deleteRecordsSafely({
    res,
    req,
    prisma,
    model: prisma.pages,
    modelName: "Pages",
    rawIds: req.body.id,
    externalDomain: ["res.cloudinary.com"],
    maxLimit: 10,
    txClient: prisma,
  });
  return result;
};
