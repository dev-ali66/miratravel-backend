import { StatusCodes } from "http-status-codes";
import { extractDomains } from "../utils/extractDomains.js";
import { extractExternalUrlsDeep } from "../utils/extractExternalUrls.js";
import { retryOperation } from "../utils/retryOperation.js";
import { deleteFromCloudinary } from "./delete_cloudinary.service.js";
import {
  uploadFilesToLocalStorage,
  deleteFromLocalStorage,
} from "./upload_local.service.js";
import ApiError from "../utils/api.error.js";
import { redisManager } from "../config/redis.js";
import { l1Cache } from "../utils/l1Cache.helper.js";
import { auditLogger } from "../logger/audit.logger.js";
import { syncEntityMediaReferences } from "./mediaReference.service.js";

type DeleteFn = (url: string) => Promise<any>;

const externalDeleteMap: Record<string, DeleteFn> = {
  "res.cloudinary.com": async (url: string) => {
    try {
      return await deleteFromCloudinary(url);
    } catch {
      // ignore
    }
  },
  "uploads": deleteFromLocalStorage,
  "api.miratravel.nl": deleteFromLocalStorage,
  "localhost": deleteFromLocalStorage,
};
export const autoParseJSON = (obj: any, convertNumber = true) => {
  for (const key in obj) {
    const value = obj[key];

    if (typeof value === "string") {
      const trimmed = value.trim();

      // Try auto parse JSON-like strings
      if (
        (trimmed.startsWith("[") && trimmed.endsWith("]")) ||
        (trimmed.startsWith("{") && trimmed.endsWith("}"))
      ) {
        try {
          obj[key] = JSON.parse(trimmed);
        } catch {
          // keep original if invalid JSON
        }
      }

      // Convert boolean strings
      if (trimmed === "true") obj[key] = true;
      if (trimmed === "false") obj[key] = false;

      // Convert numeric strings
      if (convertNumber) {
        if (!isNaN(Number(trimmed)) && trimmed !== "") {
          obj[key] = Number(trimmed);
        }
      }
    }
  }
  return obj;
};

export const manageRecordWithFiles = async ({
  req,
  res,
  prisma,
  include,
  select,
  dbField = null,
  ownerField = null,
  model,
  modelName,
  convertNumber = true,
  externalDomain,
  attachUser = true,
  auth = true,
  audit = true,
}: any) => {
  try {
    const data = {
      ...req.validated?.body,
      ...req.validated?.query,
      ...req.validated?.params,
    };
    const files = req.files || [];
    const { id, ...sanitizeData } = data;
    let updateData = autoParseJSON({ ...sanitizeData }, convertNumber);
    let uploadedFilesInfo = [];
    let uploadedNewUrls = [];
    let previousRecord = null;
    let whereClause = { id: data.id };
    let isOwner = false;
    let scope = null;

    const manageScopeFilter = () => {
      if (!req.matchedPermissions) {
        return {};
      }
      const reqActionStr = (req.action || "").toLowerCase();
      const permission = req.matchedPermissions.find(
        (p: any) =>
          p.action.toLowerCase() === reqActionStr ||
          p.action === "*",
      );

      if (!permission) throw new ApiError("No permission for this action");

      scope = permission.scope;

      // 🔴 OWN but no dbField → block
      if (scope === "OWN" && !dbField) {
        throw new ApiError("Unauthorized: OWN scope but no ownership defined", StatusCodes.BAD_REQUEST,);
      }

      //  OWN with field
      if (scope === "OWN" && dbField) {
        if (data.id) {
          if (typeof dbField === "string")
            return { [dbField]: ownerField ? ownerField : req.auth?.id };
        } else {
          updateData[dbField] = ownerField;
        }
      }
      // other scope
      if (scope === "OTHER") {
        if (!dbField) {
          throw new ApiError("OTHER scope but no ownership field defined");
        }

        return {
          [dbField]: {
            not: ownerField ? ownerField : req.auth?.id,
          },
        };
      }

      // ✅ ANY
      return {};
    };
    whereClause = { ...whereClause, ...manageScopeFilter() };

    // Check existing record if UPDATE
    if (data.id) {
      previousRecord = await model.findUnique({
        where: whereClause,
        include,
      });
      const currentUserId = ownerField || req.auth?.id;
      if (previousRecord && previousRecord[dbField] === currentUserId) {
        isOwner = true;
      }
    }
    // Apply scope rules
    const reqActionUpper = (req.action || (data.id ? "UPDATE" : "CREATE")).toUpperCase();
    if (reqActionUpper === "CREATE") {
      if (attachUser && dbField) updateData[dbField] = ownerField || req.auth?.id;
      if (scope === "OWN" && attachUser) updateData.createdBy = req.auth?.id;
    } else if (reqActionUpper === "UPDATE") {
      if (scope === "OWN" && !isOwner)
        throw new ApiError("You can only update your own authorized records");

      if (scope === "OWN" && isOwner && attachUser)
        updateData.createdBy = req.auth?.id;

      if (scope === "OTHER") {
        if (!previousRecord)
          throw new ApiError("Record not found for OTHER scope");
        if (attachUser) updateData.createdBy = req.validated?.user?.id; // assign validated.auth.id if attached
      }
      if (scope === "ANY") {
        if (attachUser) {
          updateData.createdBy = isOwner
            ? req.auth.id
            : req.validated?.user?.id;
        }
      }
    }

    //  Normalize externalDomain to array
    const domains = externalDomain ? (extractDomains(externalDomain) as string[]) : [];
    //  Handle fileRemove (dynamic & universal)
    const filesToRemove = [req.body?.fileRemove];
    const externalUrls = new Set();
    filesToRemove.forEach((record) =>
      extractExternalUrlsDeep(record, externalUrls, domains),
    );
    let externalDeletedCount = 0;
    if (externalUrls.size && previousRecord) {
      for (const key in previousRecord) {
        const value = previousRecord[key];

        // Handle Array fields
        if (Array.isArray(value)) {
          const toRemove = value.filter((url) => externalUrls.has(url));
          if (toRemove.length) {
            updateData[key] = value.filter((url) => !externalUrls.has(url));
            toRemove.forEach((url: any) => {
              if (
                typeof url === "string" &&
                (url.includes("/multimedia/uploads/") || url.includes("/uploads/"))
              ) {
                console.warn(
                  `[manageRecordWithFiles] Direct unlinking skipped for '${url}'. Managed safely via Media Reference Tracking.`,
                );
              }
            });
          }
          continue;
        }

        // Handle Object fields (e.g. Canonical Universal Multimedia JSON objects)
        if (value && typeof value === "object") {
          const objectUrls = new Set<string>();
          extractExternalUrlsDeep(value, objectUrls, domains);
          const hasMatchingUrl = Array.from(objectUrls).some((u) => externalUrls.has(u));

          if (hasMatchingUrl) {
            const sanitizeObject = (obj: any): any => {
              if (!obj || typeof obj !== "object") return obj;
              if (Array.isArray(obj)) {
                return obj.filter((item) => !externalUrls.has(item)).map(sanitizeObject);
              }
              const result: any = { ...obj };
              for (const prop in result) {
                if (typeof result[prop] === "string" && externalUrls.has(result[prop])) {
                  result[prop] = "";
                } else if (typeof result[prop] === "object") {
                  result[prop] = sanitizeObject(result[prop]);
                }
              }
              return result;
            };

            updateData[key] = sanitizeObject(value);
          }
        }
      }
    }

    // Handle new uploads (dynamic field names)
    for (const file of files) {
      const field = file.fieldname;

      if (!Array.isArray(updateData[field])) {
        updateData[field] = previousRecord?.[field] || [];
      }

      const result: any = await uploadFilesToLocalStorage(
        file.buffer,
        file.mimetype,
        field,
        file.originalname || "file",
      );

      const uploadedUrl = result.secure_url || result.url;
      updateData[field].push(uploadedUrl);
      uploadedFilesInfo.push(result);
      uploadedNewUrls.push(uploadedUrl);
    }

    //  Save to DB with rollback
    let operation;
    //console.log(updateData)

    try {
      if (data.id) {
        operation = await model.update({
          where: whereClause,
          data: {
            ...updateData,
          },
          include,
          select,
        });
      } else {
        operation = await model.create({
          data: {
            ...updateData,
          },
          include,
          select,
        });
      }
      if (audit) {
        await auditLogger({
          req,
          entityId: operation.id,
          before: previousRecord,
          after: operation,
          metadata: {
            source: "database",
            operation: data.id ? "UPDATE" : "CREATE",
          },
        });
      }

      // Sync media references so Media Gallery tracks live usage & prevents accidental deletion
      if (operation && operation.id && modelName) {
        try {
          await syncEntityMediaReferences(modelName, operation.id, operation);
        } catch (syncErr) {
          console.warn(`[manageRecordWithFiles] syncEntityMediaReferences error for ${modelName}:${operation.id}`, syncErr);
        }
      }
      // 🔥 CACHE INVALIDATION (L1 RAM + L2 REDIS)
      l1Cache.clear();

      const redis = redisManager.getClient();

      if (redis && redisManager.isReady()) {
        try {
          const tagKey = `tag:${model.name}`;

          const keys = await redis.smembers(tagKey);

          if (keys.length) {
            await redis.del(...keys);
          }

          await redis.del(tagKey);
        } catch (redisErr) {
          console.warn("Redis cache invalidation error in manageRecordWithFiles:", redisErr);
        }
      }
    } catch (dbErr) {
      // Rollback newly uploaded files
      for (const url of uploadedNewUrls) {
        try {
          if (url.includes("/multimedia/uploads/") || url.includes("/uploads/")) {
            await deleteFromLocalStorage(url);
          } else {
            await deleteFromCloudinary(url);
          }
        } catch (rollbackErr) {
          console.error("Rollback failed:", rollbackErr);
        }
      }
      throw dbErr;
    }
    return {
      code: StatusCodes.OK,
      success: true,
      message: data.id
        ? `${modelName} updated successfully`
        : `${modelName} added successfully`,
      data: operation,
    };
  } catch (error) {
    throw error;
  }
};
