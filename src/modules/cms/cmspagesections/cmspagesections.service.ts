import { manageRecordWithFiles } from "../../../shared/manageRecordWithFiles.service.js";
import { deleteRecordsSafely } from "../../../shared/delete.service.js";
import prisma from "../../../config/prisma.js";
import { getRecords } from "../../../shared/getRecords.service.js";

export const getCmsPageSectionsService = async (req: any) => {
  let result = await getRecords({
    req,
    model: prisma.cmsPageSection,
    modelName: "cmsPageSections",
  });

  return result;
};

export const manageCmsPageSectionsService = async (req: any, res: any) => {
  let result = await manageRecordWithFiles({
    req,
    res,
    prisma,
    model: prisma.cmsPageSection,
    modelName: "cmsPageSections",
    externalDomain: ["res.cloudinary.com"],
    attachUser: false,
  });

  return result;
};
export const deleteCmsPageSectionsService = async (req: any, res: any) => {
  const result = await deleteRecordsSafely({
    res,
    req,
    prisma,
    model: prisma.cmsPageSection,
    modelName: "cmsPageSections",
    rawIds: req.body.id,
    externalDomain: ["res.cloudinary.com"],
    maxLimit: 10,
    txClient: prisma,
  });
  return result;
};
