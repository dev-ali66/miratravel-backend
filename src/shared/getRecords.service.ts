import { StatusCodes } from "http-status-codes";
import ApiError from "../utils/api.error.js";
import { redisManager } from "../config/redis.js";
import { l1Cache } from "../utils/l1Cache.helper.js";
import { autoParseJSON } from "./manageRecordWithFiles.service.js";
import { auditLogger } from "../logger/audit.logger.js";

export const getRecords = async ({
  req,
  model,
  modelName,
  include,
  select,
  limitDefault = 10,
  dbField = null,
  ownerField = null,
  orderBy = { createdAt: "desc" },
  customWhere = {},
  convertNumber = true,
  singleRecordAsArray = true,
  audit = true,
  softDelete = true,
  excludeFilterKeys = [],
}: any) => {
  const redis = redisManager.getClient();

  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || limitDefault;

  const readScopeFilter = () => {
    if (!req.matchedPermissions) return {};

    const permission = req.matchedPermissions.find(
      (p: any) => p.action === "READ" || p.action === "*",
    );

    if (!permission)
      throw new ApiError(
        "No permission for this action",
        StatusCodes.BAD_REQUEST,
      );

    if (permission.scope === "OWN" && dbField) {
      return { [dbField]: ownerField ? ownerField : req.auth.id };
    }

    if (permission.scope === "OTHER" && dbField) {
      return {
        [dbField]: {
          not: ownerField ? ownerField : req.auth.id,
        },
      };
    }

    return {};
  };

  let filter = {
    ...req?.validated?.query,
    ...req?.validated?.body,
    ...req?.params,
    ...readScopeFilter(),
  };

  // for conver number fields in filter, we can use autoParseJSON function
  filter = autoParseJSON(filter, convertNumber);

  filter = Object.keys(filter).reduce((acc: any, key) => {
    if (excludeFilterKeys.includes(key)) return acc;

    const value = filter[key];
    if (value === undefined || value === null) return acc;
    if (typeof value === "string" && value.trim() === "") return acc;

    if (
      key === "id" ||
      key === "user" ||
      key === "status" ||
      key === "parentId" ||
      key === "locationId"
    )
      acc[key] = value;
    else if (typeof value === "string") {
      acc[key] = { contains: value, mode: "insensitive" };
    } else {
      acc[key] = value;
    }

    return acc;
  }, {});

  // const cacheKey = `cache:${modelName}:${page}:${limit}:${JSON.stringify(filter)}:${JSON.stringify(customWhere)}`;

  // const route = req.originalUrl.split("?")[0];
  // const cacheKey = `cache:${modelName}:${route}:${page}:${limit}:${JSON.stringify(filter)}:${JSON.stringify(customWhere)}`;

  const cacheKey = [
    "cache",
    modelName,
    req.method,
    req.baseUrl,
    req.path,
    page,
    limit,
    JSON.stringify(filter),
    JSON.stringify(customWhere),
  ].join(":");
  const tagKey = `tag:${model.name}`;

  // 🔥 1. CHECK L1 CACHE (In-Memory RAM - Ultra fast <0.01ms)
  const l1Cached = l1Cache.get(cacheKey);
  if (l1Cached) {
    if (audit) {
      await auditLogger({
        req,
        action: req.action || "READ",
        entity: req.modelName || modelName,
        metadata: {
          source: "l1-memory-cache",
          page,
          limit,
          filter,
          orderBy,
          returned: Array.isArray(l1Cached.data)
            ? l1Cached.data.length
            : l1Cached.data
              ? 1
              : 0,
        },
      }).catch(() => {});
    }
    return l1Cached;
  }

  // 🔥 2. CHECK L2 CACHE (Redis Centralized Cache)
  if (redis && redisManager.isReady()) {
    try {
      const cached = await redis.get(cacheKey);

      if (cached) {
        const cachedResponse = JSON.parse(cached);

        // Populate L1 Cache so subsequent requests hit RAM instantly
        l1Cache.set(cacheKey, cachedResponse, 300);

        if (audit) {
          await auditLogger({
            req,
            action: req.action || "READ",
            entity: req.modelName || modelName,
            metadata: {
              source: "l2-redis-cache",
              page,
              limit,
              filter,
              orderBy,
              returned: Array.isArray(cachedResponse.data)
                ? cachedResponse.data.length
                : cachedResponse.data
                  ? 1
                  : 0,
            },
          }).catch(() => {});
        }

        return cachedResponse;
      }
    } catch (redisErr) {
      console.warn(
        "Redis L2 GET error in getRecords (falling back to DB):",
        redisErr,
      );
    }
  }

  const [result, total] = await Promise.all([
    model.findMany({
      where: {
        ...filter,
        ...customWhere,
        ...(softDelete ? { deletedAt: null } : {}),
      },
      include,
      select,
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
    }),
    model.count({
      where: {
        ...filter,
        ...customWhere,
        ...(softDelete ? { deletedAt: null } : {}),
      },
    }),
  ]);

  const response = {
    code: StatusCodes.OK,
    success: true,
    message: result.length
      ? `${result.length} : ${modelName} fetched successfully`
      : "No data found",
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
    data: !result?.length
      ? null
      : result.length === 1 && !singleRecordAsArray
        ? result[0]
        : result,
  };
  if (audit) {
    await auditLogger({
      req,
      action: req.action || "READ",
      entity: req.modelName || modelName,
      metadata: {
        source: "database",
        total,
        page,
        limit,
        returned: Array.isArray(result) ? result.length : result ? 1 : 0,
        filter,
        orderBy,
      },
    }).catch(() => {});
  }

  // 🔥 3. SAVE TO L1 (RAM: 300s TTL) AND L2 (REDIS: 21600s TTL)
  l1Cache.set(cacheKey, response, 300);

  if (redis && redisManager.isReady()) {
    try {
      await redis.set(cacheKey, JSON.stringify(response), "EX", 21600);

      // attach key to model tag
      await redis.sadd(tagKey, cacheKey);
    } catch (redisErr) {
      console.warn("Redis L2 SET error in getRecords:", redisErr);
    }
  }

  return response;
};
