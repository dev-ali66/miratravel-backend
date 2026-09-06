import { StatusCodes } from "http-status-codes";
import successResponse from "../utils/success.response.js";

export const getMultiRecords = async ({
  res,
  queries,
  name = "Records",
}: any) => {
  const results: any = {};

  await Promise.all(
    queries.map(async ({ key, model, where, include, orderBy }: any) => {
      results[key] = await model.findMany({
        where,
        include,
        orderBy: orderBy || { createdAt: "desc" },
      });
    }),
  );

  return successResponse({
    res,
    code: StatusCodes.OK,
    success: true,
    message: `${name} fetched successfully`,
    data: results,
  });
};
