import swaggerUi from "swagger-ui-express";
import { buildOpenAPI } from "./openapi.builder.js";

export const setupSwagger = (app: any) => {
  const spec = buildOpenAPI();

  app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(spec));

  app.get("/api/swagger.json", (req: any, res: any) => {
    res.json(spec);
  });
};