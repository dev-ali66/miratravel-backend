import { Response } from "express";

type SuccessResponseParams<T = any> = {
  res: Response;
  code?: number;
  success?: boolean;
  message?: string;
  meta?: any | null;
  data?: T | null;
};

const successResponse = <T>({
  res,
  code = 200,
  success = true,
  message = "",
  meta = null,
  data = null,
}: SuccessResponseParams<T>) => {
  return res.status(code).json({
    success,
    message,
    code,
    meta,
    data,
  });
};

export default successResponse;
