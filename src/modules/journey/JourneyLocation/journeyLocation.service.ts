import prisma from "../../../config/prisma.js";

import { manageRecordWithFiles } from "../../../shared/manageRecordWithFiles.service.js";
import { deleteRecordsSafely } from "../../../shared/delete.service.js";
import { getRecords } from "../../../shared/getRecords.service.js";

export const getJourneyLocationService = async (req: any) => {
  const { id, journeyId, locationId } = req.query;

  const customWhere: any = {};
  if (id) customWhere.id = id;
  if (journeyId) customWhere.journeyId = journeyId;
  if (locationId) customWhere.locationId = locationId;

  return getRecords({
    req,
    model: prisma.journeyLocation,
    customWhere,
    modelName: "JourneyLocation",
    include: { location: true },
    orderBy: { order: "asc" },
  });
};

export const manageJourneyLocationService = async (req: any, res: any) => {
  const { journeyId, locationId } = req.validated.body;

  if (journeyId) {
    const journey = await prisma.journey.findUnique({ where: { id: journeyId } });
    if (!journey) throw new Error("Journey not found");
  }

  if (locationId) {
    const location = await prisma.location.findUnique({ where: { id: locationId } });
    if (!location) throw new Error("Location not found");
  }

  return manageRecordWithFiles({
    req,
    res,
    prisma,
    model: prisma.journeyLocation,
    modelName: "journeyLocation",
    include: { location: true },
    externalDomain: ["res.cloudinary.com"],
    attachUser: false,
  });
};

export const deleteJourneyLocationService = async (req: any, res: any) => {
  return deleteRecordsSafely({
    res,
    req,
    prisma,
    model: prisma.journeyLocation,
    modelName: "journeyLocation",
    rawIds: req.body.id,
    externalDomain: ["res.cloudinary.com"],
    maxLimit: 20,
    txClient: prisma,
  });
};