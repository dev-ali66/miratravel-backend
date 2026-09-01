import prisma from "../../../config/prisma.js";

import { manageRecordWithFiles } from "../../../shared/manageRecordWithFiles.service.js";
import { deleteRecordsSafely } from "../../../shared/delete.service.js";
import { getRecords } from "../../../shared/getRecords.service.js";
import ApiError from "../../../utils/api.error.js";

const journeyAddOnInclude = {
  addOn: true,
  location: true,
};

export const getJourneyAddOnService = async (req: any) => {
  const { id, journeyId, addOnId } = req.query;

  const customWhere: any = {};
  if (id) customWhere.id = id;
  if (journeyId) customWhere.journeyId = journeyId;
  if (addOnId) customWhere.addOnId = addOnId;

  return getRecords({
    req,
    model: prisma.journeyAddOn,
    customWhere,
    modelName: "JourneyAddOn",
    include: journeyAddOnInclude,
  });
};

export const manageJourneyAddOnService = async (req: any, res: any) => {
  const { id, journeyId, addOnId, locationId } = req.validated.body;

  const existingRecord = id
    ? await prisma.journeyAddOn.findUnique({
        where: { id },
        select: { journeyId: true, locationId: true },
      })
    : null;

  if (id && !existingRecord) throw new ApiError("Journey AddOn not found", 404);

  const effectiveJourneyId = journeyId || existingRecord?.journeyId;
  const effectiveLocationId = locationId || existingRecord?.locationId;

  if (effectiveJourneyId) {
    const journey = await prisma.journey.findUnique({ where: { id: effectiveJourneyId } });
    if (!journey) throw new ApiError("Journey not found", 404);
  }

  try {
    return await manageRecordWithFiles({
      req,
      res,
      prisma,
      model: prisma.journeyAddOn,
      modelName: "journeyAddOn",
      include: journeyAddOnInclude,
      externalDomain: [],
      attachUser: false,
    });
  } catch (error: any) {
    // Duplicate journeyId + addOnId combination (DB-level unique constraint)
    if (error?.code === "P2002") {
      throw new ApiError("This AddOn is already attached to the Journey", 409);
    }
    throw error;
  }
};

export const deleteJourneyAddOnService = async (req: any, res: any) => {
  return deleteRecordsSafely({
    res,
    req,
    prisma,
    model: prisma.journeyAddOn,
    modelName: "journeyAddOn",
    rawIds: req.body.id,
    externalDomain: [],
    maxLimit: 20,
    txClient: prisma,
  });
};
