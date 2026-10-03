import prisma from "../../config/prisma.js";
import { getRecords } from "../../shared/getRecords.service.js";
import { manageRecordWithFiles } from "../../shared/manageRecordWithFiles.service.js";
import { deleteRecordsSafely } from "../../shared/delete.service.js";

const getModel = () => (prisma as any).newsletterSubscriber || (prisma as any).NewsletterSubscriber;

export const subscribeNewsletter = async (reqOrData: any, res?: any) => {
  const isReq = reqOrData && (reqOrData.body !== undefined || reqOrData.validated !== undefined);
  const body = isReq
    ? (reqOrData.validated?.body || reqOrData.body || {})
    : reqOrData;

  const email = (body.email || "").trim().toLowerCase();
  const source = body.source || "FOOTER";
  const action = body.action || "subscribe";

  if (!email) {
    throw new Error("Email address is required");
  }

  const model = getModel();
  const existing = await model.findFirst({
    where: { email },
  });

  const targetStatus = action === "unsubscribe" ? "UNSUBSCRIBED" : "SUBSCRIBED";

  let subscriber;
  if (existing) {
    subscriber = await model.update({
      where: { id: existing.id },
      data: {
        status: targetStatus,
        deletedAt: null,
        ...(source ? { source } : {}),
      },
    });
  } else {
    subscriber = await model.create({
      data: {
        email,
        source,
        status: targetStatus,
      },
    });
  }

  const message = targetStatus === "UNSUBSCRIBED"
    ? "You have been successfully unsubscribed from MIRA dispatches."
    : "Thank you for subscribing to MIRA travel dispatches!";

  return {
    code: 200,
    success: true,
    message,
    data: subscriber,
  };
};

export const getNewsletterSubscribers = async (reqOrQuery: any) => {
  const isReq = reqOrQuery && (reqOrQuery.query !== undefined || reqOrQuery.validated !== undefined);
  const req = isReq
    ? reqOrQuery
    : { validated: { query: reqOrQuery || {} }, query: reqOrQuery || {} };

  const queryObj = req.validated?.query || req.query || {};
  const search = (queryObj.search || "").trim();
  const customWhere: any = {};
  if (search) {
    customWhere.email = { contains: search, mode: "insensitive" };
  }

  return await getRecords({
    req,
    model: getModel(),
    modelName: "NewsletterSubscriber",
    excludeFilterKeys: ["page", "limit", "search"],
    customWhere,
  });
};

export const updateNewsletterSubscriber = async (idOrReq: any, dataOrRes?: any, res?: any) => {
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
      modelName: "NewsletterSubscriber",
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
    modelName: "NewsletterSubscriber",
    attachUser: false,
    auth: false,
    audit: false,
  });
};

export const deleteNewsletterSubscriber = async (idOrReq: any, res?: any) => {
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
    modelName: "NewsletterSubscriber",
    softDelete: true,
    rawIds,
    txClient: prisma,
  });
};
