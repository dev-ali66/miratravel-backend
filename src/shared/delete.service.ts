import { extractIds } from "../utils/extractIds.js";
import { StatusCodes } from "http-status-codes";
import ApiError from "../utils/api.error.js";
import { redisManager } from "../config/redis.js";
import { l1Cache } from "../utils/l1Cache.helper.js";
import { auditLogger } from "../logger/audit.logger.js";

export const deleteRecordsSafely = async ({
  req,
  prisma,
  model,
  modelName,
  rawIds,
  dbField = null,
  ownerField = null,
  maxLimit = 10,
  txClient = prisma,
  audit = true,
  softDelete = true,
}: any) => {
  const ids = extractIds(rawIds);

  if (!ids || ids.length === 0) return { deletedCount: 0, externalDeleted: 0 };

  if (ids.length > maxLimit)
    throw new Error(`Delete limit exceeded (${maxLimit})`);

  const getScopeFilter = () => {
    if (!req.matchedPermissions) return {};

    const reqActionStr = (req.action || "DELETE").toLowerCase();
    const permission = req.matchedPermissions.find(
      (p: any) =>
        p.action.toLowerCase() === reqActionStr || p.action === "*",
    );

    if (!permission) throw new ApiError("No permission for this action");

    const scope = permission.scope;

    if (scope === "OWN") {
      if (!dbField) throw new ApiError("OWN scope missing field");
      return { [dbField]: ownerField ? ownerField : req.auth.id };
    }

    if (scope === "OTHER") {
      if (!dbField) throw new ApiError("OTHER scope missing field");
      return {
        [dbField]: {
          not: ownerField ? ownerField : req.auth.id,
        },
      };
    }

    return {};
  };

  const whereClause = { id: { in: ids }, ...getScopeFilter() };
  const requestSoftDelete = req?.body?.softDelete ?? req?.query?.softDelete;
  const hardDeleteRequested =
    requestSoftDelete === false ||
    (typeof requestSoftDelete === "string" &&
      requestSoftDelete.toLowerCase() === "false");
  const shouldSoftDelete = softDelete && !hardDeleteRequested;

  // A hard delete deliberately skips record lookup, external deletion, cache
  // invalidation, and audit logging.
  if (!shouldSoftDelete) {
    const result = await txClient.$transaction(async (tx: any) => {
      return tx[modelName].deleteMany({ where: whereClause });
    });

    return {
      code: StatusCodes.OK,
      success: true,
      message: "Hard deleted successfully",
      data: result,
    };
  }

  const softDeleteWhereClause = { ...whereClause, deletedAt: null };

  const records = await model.findMany({ where: softDeleteWhereClause });

  if (!records.length) {
    return {
      code: StatusCodes.OK,
      success: true,
      message: "No data Found",
    };
  }

  const deletedAt = new Date();

  // Soft-deleted records retain their external files for a possible restore.
  const result = await txClient.$transaction(async (tx: any) => {
    return tx[modelName].updateMany({
      where: softDeleteWhereClause,
      data: { deletedAt },
    });
  });

  // 🚀 CACHE INVALIDATION (L1 RAM + L2 REDIS)
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
      console.warn("Redis cache invalidation error in deleteRecordsSafely:", redisErr);
    }
  }
  // ===========================
  // AUDIT LOG (OPTIONAL)
  // ===========================
  if (audit) {
    await Promise.all(
      records.map((record: any) =>
        auditLogger({
          req,
          entityId: record.id,
          before: record,
          after: { ...record, deletedAt },
          metadata: {
            source: "database",
          },
        }),
      ),
    );
  }
  return {
    code: StatusCodes.OK,
    success: true,
    message: "Deleted success",
    data: result,
  };
};

// import { retryOperation } from "../utils/retryOperation.js";
// import { extractExternalUrlsDeep } from "../utils/extractExternalUrls.js";
// import { extractIds } from "../utils/extractIds.js";
// import { deleteFromCloudinary } from "./delete_cloudinary.service.js";
// import { extractDomains } from "../utils/extractDomains.js";
// import { StatusCodes } from "http-status-codes";
// import successResponse from "../utils/success.response.js";
// import ApiError from "../utils/api.error.js";
// // import { deleteFromS3 } from "./delete_s3.service";
// // import { deleteFromImagebb } from "./delete_imagebb.service";

// /**
//  * Map domain substring → delete function
//  * Add more services as needed
//  */
// const externalDeleteMap: Record<string, (url: string) => Promise<void>> = {
//     "res.cloudinary.com": deleteFromCloudinary,
//     // "s3.com": deleteFromS3,
//     // "imagebb.com": deleteFromImagebb
// };

// /**
//  * Generic reusable delete function
//  */
// export const deleteRecordsSafely = async ({
//     req,
//     prisma,
//     model,
//     modelName,
//     rawIds,
//     externalDomain,
//     dbField = null,
//     ownerField = null,
//     maxLimit = 10,
//     txClient = prisma
// }: any) => {

//     // Extract IDs internally
//     const ids = extractIds(rawIds);

//     if (!ids || ids.length === 0) return { deletedCount: 0, externalDeleted: 0 };
//     if (ids.length > maxLimit) throw new Error(`Delete limit exceeded (${maxLimit})`);

//     // Normalize externalDomain to array
//     const domains = extractDomains(externalDomain);

//     // permission && scope check
//     const getScopeFilter = () => {
//         if (!req.matchedPermissions) return {};

//         const permission = req.matchedPermissions.find(
//             (p: any) =>
//                 p.action.toLowerCase() === req.action.toLowerCase() ||
//                 p.action === "*"
//         );

//         if (!permission) {
//             throw new ApiError("No permission for this action");
//         }

//         const scope = permission.scope;
//         // OWN scope
//         if (scope === "OWN") {
//             if (!Array.isArray(dbField) && !dbField) {
//                 throw new ApiError("OWN scope but no ownership field defined");
//             }

//             return {
//                 [dbField]: ownerField ? ownerField : req.auth.id
//             };
//         }
//         // other scope
//         if (scope === "OTHER") {
//             if (!dbField) {
//                 throw new ApiError("OTHER scope but no ownership field defined");
//             }

//             return {
//                 [dbField]: {
//                     not: ownerField ? ownerField : req.auth.id
//                 }
//             };
//         }

//         // ANY scope
//         return {};
//     };

//     // Fetch records
//     let records: any[] = [];
//     let whereClause = { id: { in: ids }, ...getScopeFilter() }
//     records = await model.findMany({ where: whereClause });

//     if (!records.length) return ({
//         code: StatusCodes.OK,
//         success: true,
//         message: "No data Found"
//     });

//     //  Collect all external URLs
//     const externalUrls = new Set();
//     records.forEach((record: any) => extractExternalUrlsDeep(record, externalUrls, domains));

//     //  Delete external URLs dynamically
//     let externalDeletedCount = 0;

//     if (domains.length > 0) {
//         const deleteResults = await Promise.all(
//             [...externalUrls].map(async (url) => {
//                 const matchedDomain = domains.find(d => url.includes(d));
//                 if (!matchedDomain) return 0;

//                 const deleteFn = externalDeleteMap[matchedDomain];
//                 if (!deleteFn) return 0;

//                 await retryOperation(() => deleteFn(url), 3);
//                 return 1;
//             })
//         );

//         externalDeletedCount = deleteResults.reduce((sum, val) => sum + val, 0 as number);
//     }

//     // 6️ Transaction-safe DB delete
//     const result = await txClient.$transaction(async (tx: any) => {
//         return await tx[modelName].deleteMany({ where: whereClause });
//     });

//     if (result) {
//         const labels = [];

//         for (const r of records) {
//             const label = r?.name ?? r?.title ?? r?.slug ?? r?.id;
//             if (label) labels.push(label);
//         }

//         return ({
//             code: StatusCodes.OK,
//             success: true,
//             message: labels.length
//                 ? `${labels.join(" , ")} deleted successfully`
//                 : "Deleted successfully",
//             data: result
//         });
//     }

// };
