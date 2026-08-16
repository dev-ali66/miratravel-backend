import { getRecords } from "../../../shared/getRecords.service.js";
import { manageRecordWithFiles } from "../../../shared/manageRecordWithFiles.service.js";
import { deleteRecordsSafely } from "../../../shared/delete.service.js";
import prisma from "../../../config/prisma.js";

export const getjourneysPricingService = async (req: any) => {
  let result = await getRecords({
    req,
    model: prisma.journeysPricing,
    modelName: "journeysPricing",
  });

  return result;
};

export const managejourneysPricingService = async (req: any, res: any) => {
  let result = await manageRecordWithFiles({
    req,
    res,
    prisma,
    model: prisma.journeysPricing,
    modelName: "journeysPricing",
    externalDomain: ["res.cloudinary.com"],
    convertNumber: false,
    attachUser: true,
  });

  return result;
};
export const deletejourneysPricingService = async (req: any, res: any) => {
  const result = await deleteRecordsSafely({
    res,
    req,
    prisma,
    model: prisma.journeysPricing,
    modelName: "journeysPricing",
    rawIds: req.body.id,
    externalDomain: ["res.cloudinary.com"],
    maxLimit: 10,
    txClient: prisma,
  });
  return result;
};
