import { StatusCodes } from "http-status-codes";
import { extractDomains } from "../utils/extractDomains.js";
import { extractExternalUrlsDeep } from "../utils/extractExternalUrls.js";
import { retryOperation } from "../utils/retryOperation.js";
import { deleteFromCloudinary } from "./delete_cloudinary.service.js";
import { uploadFilesToCloudinary } from "./upload_cloudinary.service.js";
import ApiError from "../utils/api.error.js";
import { redisManager } from "../config/redis.js";
import { auditLogger } from "../logger/audit.logger.js";

type DeleteFn = (url: string) => Promise<any>;

const externalDeleteMap: Record<string, DeleteFn> = {
  "res.cloudinary.com": deleteFromCloudinary,
  // "s3.com": deleteFromS3,
  // "imagebb.com": deleteFromImagebb
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
      const permission = req.matchedPermissions.find(
        (p: any) =>
          p.action.toLowerCase() === req.action.toLowerCase() ||
          p.action === "*",
      );

      if (!permission) throw new ApiError("No permission for this action");

      scope = permission.scope;

      // 🔴 OWN but no dbField → block
      if (scope === "OWN" && !dbField) {
        // console.log("Unauthorized: OWN scope but no ownership defined", StatusCodes.BAD_REQUEST);
        throw new ApiError(
          "Unauthorized: OWN scope but no ownership defined",
          StatusCodes.BAD_REQUEST,
        );
      }

      //  OWN with field
      if (scope === "OWN" && dbField) {
        if (data.id) {
          if (typeof dbField === "string")
            return { [dbField]: ownerField ? ownerField : req.auth.id };
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
            not: ownerField ? ownerField : req.auth.id,
          },
        };
      }

      // ✅ ANY
      return {};
    };
    whereClause = { ...whereClause, ...manageScopeFilter() };
    // console.log(!!dbField)
    // console.log(dbField)
    // console.log(scope)

    // Permission + Scope check
    // const matchedPermission = req.matchedPermissions?.find(
    //     p => p.action.toLowerCase() === req.action.toLowerCase() || p.action === "*"
    // );
    // if (!matchedPermission) throw new ApiError("No permission for this action");
    // const scope = matchedPermission.scope; // OWN, OTHER, ANY

    // Check existing record if UPDATE
    if (data.id) {
      previousRecord = await model.findUnique({
        where: whereClause,
        include,
      });
      const currentUserId = ownerField || req.auth.id;
      if (previousRecord && previousRecord[dbField] === currentUserId) {
        isOwner = true;
      }
    }
    // Apply scope rules
    if (req.action.toUpperCase() === "CREATE") {
      if (scope === "OWN" && attachUser) updateData.authId = req.auth.id;
      // if (scope === "OWN" && !attachUser) throw new ApiError("Cannot create this record");
    } else if (req.action.toUpperCase() === "UPDATE") {
      if (scope === "OWN" && !isOwner)
        throw new ApiError("You can only update your own authorized records");

      if (scope === "OWN" && isOwner && attachUser)
        updateData.authId = req.auth.id;

      if (scope === "OTHER") {
        if (!previousRecord)
          throw new ApiError("Record not found for OTHER scope");
        if (attachUser) updateData.authId = req.validated?.user?.id; // assign validated.auth.id if attached
      }
      if (scope === "ANY") {
        if (attachUser) {
          updateData.authId = isOwner ? req.auth.id : req.validated?.user?.id;
        }
      }
    }

    //  Normalize externalDomain to array
    const domains = extractDomains(externalDomain) as string[];
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

        if (!Array.isArray(value)) continue;

        // URLs to remove from this field
        const toRemove = value.filter((url) => externalUrls.has(url));

        if (!toRemove.length) continue;

        // Update DB value (keep remaining)
        updateData[key] = value.filter((url) => !externalUrls.has(url));

        //  Delete from external storage
        await Promise.all(
          toRemove.map(async (url) => {
            const matchedDomain = domains.find((d) => url.includes(d));
            if (!matchedDomain) return;

            const deleteFn = externalDeleteMap[matchedDomain];
            if (!deleteFn) {
              console.warn("No delete function mapped for URL:", url);
              return;
            }

            await retryOperation(() => deleteFn(url), 3);
            externalDeletedCount++;
          }),
        );
      }
    }

    // Handle new uploads (dynamic field names)
    for (const file of files) {
      const field = file.fieldname;

      if (!Array.isArray(updateData[field])) {
        updateData[field] = previousRecord?.[field] || [];
      }

      const result: any = await uploadFilesToCloudinary(
        file.buffer,
        file.mimetype,
        field,
        {},
      );

      updateData[field].push(result.secure_url);
      uploadedFilesInfo.push(result);
      uploadedNewUrls.push(result.secure_url);
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
      // 🔥 CACHE INVALIDATION
      const redis = redisManager.getClient();

      if (redis) {
        const tagKey = `tag:${model.name}`;

        const keys = await redis.smembers(tagKey);

        if (keys.length) {
          await redis.del(...keys);
        }

        await redis.del(tagKey);
      }
    } catch (dbErr) {
      // Rollback newly uploaded files
      for (const url of uploadedNewUrls) {
        try {
          await deleteFromCloudinary(url);
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