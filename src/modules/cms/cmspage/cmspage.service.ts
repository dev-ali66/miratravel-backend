import { manageRecordWithFiles } from "../../../shared/manageRecordWithFiles.service.js";
import { deleteRecordsSafely } from "../../../shared/delete.service.js";
import prisma from "../../../config/prisma.js";
import { getRecords } from "../../../shared/getRecords.service.js";

export const getCmsPageService = async (req: any) => {
  let result = await getRecords({
    req,
    model: prisma.cmsPage,
    modelName: "cmsPage",
    include: {
      sections: true
    }
  });

  return result;
};

export const manageCmsPageService = async (req: any, res: any) => {

  let result = await manageRecordWithFiles({
    req,
    res,
    prisma,
    model: prisma.cmsPage,
    modelName: "cmsPage",
    externalDomain: ["res.cloudinary.com"],
    attachUser: false,
  });

  return result;
};
export const deleteCmsPageService = async (req: any, res: any) => {
  const result = await deleteRecordsSafely({
    res,
    req,
    prisma,
    model: prisma.cmsPage,
    modelName: "cmsPage",
    rawIds: req.body.id,
    externalDomain: ["res.cloudinary.com"],
    maxLimit: 10,
    txClient: prisma,
  });
  return result;
};
