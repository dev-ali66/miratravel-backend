import prisma from "../../config/prisma.js";
import { getRecords } from "../../shared/getRecords.service.js";
import { manageRecordWithFiles } from "../../shared/manageRecordWithFiles.service.js";
import { deleteRecordsSafely } from "../../shared/delete.service.js";

const getModel = () => (prisma as any).journeyWizardRequest || prisma.journeyWizardRequest;

export const createJourneyWizardRequest = async (reqOrData: any, res?: any) => {
  const isReq = reqOrData && (reqOrData.body !== undefined || reqOrData.validated !== undefined);
  const req = isReq
    ? reqOrData
    : { validated: { body: reqOrData }, body: reqOrData };
  const mockRes = res || { status: () => mockRes, json: (x: any) => x };

  return await manageRecordWithFiles({
    req,
    res: mockRes,
    prisma,
    model: getModel(),
    modelName: "JourneyWizardRequest",
    attachUser: false,
    auth: false,
    audit: false,
  });
};

export const getJourneyWizardRequests = async (reqOrQuery: any) => {
  const isReq = reqOrQuery && (reqOrQuery.query !== undefined || reqOrQuery.validated !== undefined);
  const req = isReq
    ? reqOrQuery
    : { validated: { query: reqOrQuery || {} }, query: reqOrQuery || {} };

  const search = req.query?.search || req.validated?.query?.search;
  const customWhere: any = {};

  if (search && typeof search === "string" && search.trim() !== "") {
    const term = search.trim();
    customWhere.OR = [
      { name: { contains: term, mode: "insensitive" } },
      { email: { contains: term, mode: "insensitive" } },
      { phone: { contains: term, mode: "insensitive" } },
      { notes: { contains: term, mode: "insensitive" } },
      { budgetText: { contains: term, mode: "insensitive" } },
      { duration: { contains: term, mode: "insensitive" } },
    ];
  }

  return await getRecords({
    req,
    model: getModel(),
    modelName: "JourneyWizardRequest",
    customWhere,
  });
};


export const updateJourneyWizardRequest = async (idOrReq: any, dataOrRes?: any, res?: any) => {
  if (typeof idOrReq === "string") {
    const req = {
      validated: { body: { id: idOrReq, ...dataOrRes } },
      body: { id: idOrReq, ...dataOrRes },
      params: { id: idOrReq },
    };
    const mockRes = res || { status: () => mockRes, json: (x: any) => x };
    return await manageRecordWithFiles({
      req,
      res: mockRes,
      prisma,
      model: getModel(),
      modelName: "JourneyWizardRequest",
      attachUser: false,
      auth: false,
      audit: false,
    });
  }

  return await manageRecordWithFiles({
    req: idOrReq,
    res: dataOrRes,
    prisma,
    model: getModel(),
    modelName: "JourneyWizardRequest",
    attachUser: false,
    auth: false,
    audit: false,
  });
};

export const deleteJourneyWizardRequest = async (idOrReq: any, res?: any) => {
  const rawIds = typeof idOrReq === "string" ? idOrReq : (idOrReq?.body?.id || idOrReq?.params?.id);
  const req = typeof idOrReq === "string"
    ? { body: { id: idOrReq }, params: { id: idOrReq } }
    : idOrReq;
  const mockRes = res || { status: () => mockRes, json: (x: any) => x };

  return await deleteRecordsSafely({
    req,
    res: mockRes,
    prisma,
    model: getModel(),
    modelName: "JourneyWizardRequest",
    softDelete: true,
    rawIds,
    txClient: prisma,
  });
};
