import { StatusCodes } from "http-status-codes";
import ApiError from "../../utils/api.error.js";
import prisma from "../../config/prisma.js";
import { getRecords } from "../../shared/getRecords.service.js";
import { manageRecordWithFiles } from "../../shared/manageRecordWithFiles.service.js";
import { deleteRecordsSafely } from "../../shared/delete.service.js";

const getModel = () => (prisma as any).journeyWizardRequest || prisma.journeyWizardRequest;

/**
 * Extracts and normalizes user roles from req.auth.
 */
export const extractUserRoles = (auth: any): string[] => {
  if (!auth) return [];
  const raw = auth.roles || auth.role;
  if (!raw) return [];
  if (Array.isArray(raw)) {
    return raw
      .map((r: any) => (typeof r === "string" ? r : r?.name || ""))
      .filter(Boolean)
      .map((r: string) => r.toUpperCase());
  }
  if (typeof raw === "string") {
    return [raw.toUpperCase()];
  }
  return [];
};

/**
 * Checks whether the authenticated principal has administrative/staff privileges.
 */
export const isStaffOrAdmin = (auth: any): boolean => {
  const roles = extractUserRoles(auth);
  const adminRoles = ["ADMIN", "SUPER_ADMIN", "MANAGER", "STAFF"];
  return roles.some((r) => adminRoles.includes(r));
};

export const createJourneyWizardRequest = async (reqOrData: any, res?: any) => {
  const isReq = reqOrData && (reqOrData.body !== undefined || reqOrData.validated !== undefined);
  const req = isReq
    ? reqOrData
    : { validated: { body: reqOrData }, body: reqOrData };
  const mockRes = res || { status: () => mockRes, json: (x: any) => x };

  // Associate request with authenticated user if available
  const authUserId = req.auth?.id || req.user?.id || req.body?.userId || req.validated?.body?.userId;
  const authEmail = req.auth?.email || req.user?.email;
  const authName =
    req.auth?.name ||
    [req.auth?.userPersonalInfo?.firstName, req.auth?.userPersonalInfo?.lastName]
      .filter(Boolean)
      .join(" ") ||
    null;
  const authPhone = req.auth?.phone || req.auth?.userPersonalInfo?.phone || null;

  if (req.validated?.body) {
    if (authUserId && !req.validated.body.userId) {
      req.validated.body.userId = authUserId;
    }
    if (authEmail && !req.validated.body.email) {
      req.validated.body.email = authEmail;
    }
    if (authName && !req.validated.body.name) {
      req.validated.body.name = authName;
    }
    if (authPhone && !req.validated.body.phone) {
      req.validated.body.phone = authPhone;
    }
  }
  if (req.body) {
    if (authUserId && !req.body.userId) {
      req.body.userId = authUserId;
    }
    if (authEmail && !req.body.email) {
      req.body.email = authEmail;
    }
    if (authName && !req.body.name) {
      req.body.name = authName;
    }
    if (authPhone && !req.body.phone) {
      req.body.phone = authPhone;
    }
  }

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

  const query = req.validated?.query || req.query || {};
  const search = query.search;
  const status = query.status;
  const explicitUserId = query.userId;
  const explicitEmail = query.email;

  const auth = req.auth;
  const isAdmin = isStaffOrAdmin(auth);

  // If invoked via HTTP request without authentication, reject unauthorized access
  if (req.headers && !auth) {
    throw new ApiError(
      "Authentication required to access journey requests",
      StatusCodes.UNAUTHORIZED
    );
  }

  const andConditions: any[] = [];
  const customWhere: any = {};

  // Status filter (ignore "ALL")
  if (status && status !== "ALL") {
    customWhere.status = status;
  }

  // Role-based scoping:
  // If authenticated as a regular USER (not Admin/Manager/Staff), strictly scope to their requests
  if (auth && !isAdmin) {
    const userConditions: any[] = [];
    if (auth.id) {
      userConditions.push({ userId: auth.id });
    }
    if (auth.email) {
      userConditions.push({ email: { equals: auth.email, mode: "insensitive" } });
    }
    if (userConditions.length > 0) {
      andConditions.push({ OR: userConditions });
    }
  } else {
    // Admin, staff, or internal service: allow explicit query filtering if provided
    if (explicitUserId) {
      customWhere.userId = explicitUserId;
    }
    if (explicitEmail) {
      customWhere.email = { equals: explicitEmail, mode: "insensitive" };
    }
  }

  // Search filter across text fields
  if (search && typeof search === "string" && search.trim() !== "") {
    const term = search.trim();
    andConditions.push({
      OR: [
        { name: { contains: term, mode: "insensitive" } },
        { email: { contains: term, mode: "insensitive" } },
        { phone: { contains: term, mode: "insensitive" } },
        { notes: { contains: term, mode: "insensitive" } },
        { budgetText: { contains: term, mode: "insensitive" } },
        { duration: { contains: term, mode: "insensitive" } },
      ],
    });
  }

  if (andConditions.length === 1) {
    if (andConditions[0].OR) {
      customWhere.OR = andConditions[0].OR;
    } else {
      customWhere.AND = andConditions;
    }
  } else if (andConditions.length > 1) {
    customWhere.AND = andConditions;
  }

  return await getRecords({
    req,
    model: getModel(),
    modelName: "JourneyWizardRequest",
    customWhere,
    excludeFilterKeys: ["userId", "email", "status", "search"],
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
