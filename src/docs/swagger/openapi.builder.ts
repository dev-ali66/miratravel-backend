import { scanRoutes } from "./scanRoutes.js";
import { zodToOpenAPI } from "./zodToOpenAPI.js";

export const buildOpenAPI = () => {
  const routes = scanRoutes();

  const paths: any = {};

  for (const r of routes) {
    if (!paths[r.path]) paths[r.path] = {};

    const method = r.method.toLowerCase();

    const openApiSchema = zodToOpenAPI(r.schema);

    const isBodyAllowed = ["post", "put", "patch"].includes(method);

    // -----------------------------
    // 🔥 QUERY PARAMS (FIX)
    // -----------------------------
    const queryParams =
      r.schema?.shape?.query?.shape
        ? Object.keys(r.schema.shape.query.shape).map((key) => ({
          name: key,
          in: "query",
          required: !r.schema.shape.query.shape[key].isOptional?.(),
          schema: { type: "string" },
        }))
        : [];

    paths[r.path][method] = {
      tags: [r.tag],

      // -----------------------------
      // PATH + QUERY PARAMS
      // -----------------------------
      parameters: [
        ...(r.params || []),
        ...queryParams,
      ],

      // -----------------------------
      // BODY ONLY FOR POST/PUT/PATCH
      // -----------------------------
      ...(isBodyAllowed && openApiSchema
        ? {
          requestBody: {
            required: true,
            content: {
              [r.isFormData
                ? "multipart/form-data"
                : "application/json"]: {
                schema: openApiSchema,
              },
            },
          },
        }
        : {}),

      responses: {
        200: { description: "Success" },
      },
    };
  }

  return {
    openapi: "3.0.0",
    info: {
      title: "Auto API",
      version: "1.0.0",
    },
    paths,
  };
};