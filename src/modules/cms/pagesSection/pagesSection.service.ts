import { deleteRecordsSafely } from "../../../shared/delete.service.js";
import { getRecords } from "../../../shared/getRecords.service.js";
import { manageRecordWithFiles } from "../../../shared/manageRecordWithFiles.service.js";
import prisma from "../../../config/prisma.js";

export const getPagesSectionService = async (req: any) => {
  const result = await getRecords({
    req,
    model: prisma.pagesSection,
    modelName: "Pages Section",
  });
  return result;
};

export const managePagesSectionService = async (req: any, res: any) => {
  let result = await manageRecordWithFiles({
    req,
    res,
    prisma,
    model: prisma.pagesSection,
    name: "Pages Section",
    externalDomain: ["res.cloudinary.com"],
    attachUser: true,
  });

  return result;
};
export const deletePagesSectionService = async (req: any, res: any) => {
  const result = await deleteRecordsSafely({
    res,
    req,
    prisma,
    model: prisma.pagesSection,
    modelName: "pagesSection",
    rawIds: req.body.id,
    externalDomain: ["res.cloudinary.com"],
    maxLimit: 10,
    txClient: prisma,
  });
  return result;
};
