import prisma from "../../../config/prisma.js";

import { manageRecordWithFiles } from "../../../shared/manageRecordWithFiles.service.js";
import { deleteRecordsSafely } from "../../../shared/delete.service.js";
import { getRecords } from "../../../shared/getRecords.service.js";

export const getJourneyItineraryService = async (req: any) => {
  const { id, journeyId } = req.query;

  const customWhere: any = {};
  if (id) customWhere.id = id;
  if (journeyId) customWhere.journeyId = journeyId;

  return getRecords({
    req,
    model: prisma.journeyItinerary,
    customWhere,
    modelName: "JourneyItinerary",
    include: { location: true },
    orderBy: { dayNumber: "asc" },
  });
};

export const manageJourneyItineraryService = async (req: any, res: any) => {
  const { journeyId } = req.validated.body;

  if (journeyId) {
    const journey = await prisma.journey.findUnique({ where: { id: journeyId } });
    if (!journey) throw new Error("Journey not found");
  }

  return manageRecordWithFiles({
    req,
    res,
    prisma,
    model: prisma.journeyItinerary,
    modelName: "journeyItinerary",
    include: { location: true },
    externalDomain: ["res.cloudinary.com"],
    attachUser: false,
  });
};

export const deleteJourneyItineraryService = async (req: any, res: any) => {
  return deleteRecordsSafely({
    res, req, prisma,
    model: prisma.journeyItinerary,
    modelName: "journeyItinerary",
    rawIds: req.body.id,
    externalDomain: ["res.cloudinary.com"],
    maxLimit: 30,
    txClient: prisma,
  });
};