import { StatusCodes } from "http-status-codes";
import ApiError from "../utils/api.error.js";
import { redisManager } from "../config/redis.js";

export const getCountUtils = async ({
  req,
  model,
  modelName,
  dbField = null,
  ownerField = null,
}: any) => {
  const redis = redisManager.getClient();

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
    ...req?.validated?.body,
    ...req?.params,
    ...readScopeFilter(),
  };
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

  const cacheKey = `count:${modelName}:${JSON.stringify(filter)}`;
  const tagKey = `tag:${model.name}`;

  // 🔥 1. CHECK CACHE
  if (redis) {
    const cached = await redis.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }
  }

  const hasFilter = Object.keys(filter).length > 0;

  // return console.log(filter)
  const total = await model.count({
    where: hasFilter ? filter : undefined,
  });
  const response = {
    total,
  };

  // 🔥 2. SAVE CACHE + TAG
  if (redis) {
    await redis.set(cacheKey, JSON.stringify(response), "EX", 60);
    await redis.sadd(tagKey, cacheKey);
  }

  return response;
};
