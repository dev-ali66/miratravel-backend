import { ZodError } from "zod";
import { convertBooleans } from "../utils/convertBooleans.js";
import { Request, Response, NextFunction } from "express";

declare global {
  namespace Express {
    interface Request {
      validated?: any;
    }
  }
}

export const validate = (schema: any) => {
  const middleware = (req: Request, _res: Response, next: NextFunction) => {
    try {
      const isFormData = req.headers["content-type"]?.includes(
        "multipart/form-data",
      );

      (middleware as any).__isFormData = isFormData;

      // 🔥 keep original separation (IMPORTANT for Swagger later)
      const converted = {
        params: convertBooleans({ ...req.params }),
        query: convertBooleans({ ...req.query }),
        body: convertBooleans({ ...req.body }),
      };
      req.validated = schema.parse(converted);

      next();
    } catch (e: any) {
      if (e instanceof ZodError) {
        return next(e);
      }

      next(e);
    }
  };
  (middleware as any).__zodSchema = schema;
  return middleware;
};
