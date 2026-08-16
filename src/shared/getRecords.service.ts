import { StatusCodes } from "http-status-codes";
import ApiError from "../utils/api.error.js";
import { redisManager } from "../config/redis.js";
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
  singleRecordAsArray = false,
  audit = true,
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
    const value = filter[key];
    if (value === undefined || value === null) return acc;
    if (typeof value === "string" && value.trim() === "") return acc;

    if (key === "id" || key === "user" || key === "status") acc[key] = value;
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

  const cacheKey = ["cache", modelName, req.method, req.baseUrl, req.path, page, limit, JSON.stringify(filter), JSON.stringify(customWhere),].join(":");
  const tagKey = `tag:${model.name}`;

  // 🔥 1. CHECK CACHE
  if (redis) {
    const cached = await redis.get(cacheKey);

    if (cached) {
      const cachedResponse = JSON.parse(cached);

      if (audit) {
        await auditLogger({
          req,
          action: req.action || "READ",
          entity: req.modelName || modelName,
          metadata: {
            source: "redis-cache",
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
        });
      }

      return cachedResponse;
    }
  }

  const [result, total] = await Promise.all([
    model.findMany({
      where: {
        ...filter,
        ...customWhere,
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
    data:
      !result?.length
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
    });
  }

  // 🔥 2. SAVE CACHE + TAG
  if (redis) {
    await redis.set(cacheKey, JSON.stringify(response), "EX", 60);

    // attach key to model tag
    await redis.sadd(tagKey, cacheKey);
  }

  return response;
};