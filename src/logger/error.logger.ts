import { Request } from "express";
import { logger } from "./logger.logger.js";

export const errorLogger = (req: Request, err: any) => {
    logger.error("Request Failed", {
        requestId: req.requestId ?? null,
        correlationId: req.correlationId ?? null,
        traceId: req.traceId ?? null,
        method: req.method,
        url: req.originalUrl,
        statusCode: err.statusCode || 500,
        ip: req.ip,
        proxyIp: req.headers["x-forwarded-for"] ?? null,
        user: req.auth
            ? {
                id: req.auth.id,
                email: req.auth.email,
                roles:
                    req.auth.roles?.map(({ id, name }: { id: string; name: string }) => ({
                        id,
                        name,
                    })) ?? [],
            }
            : null,

        params: req.params,
        query: req.query,
        body: req.body,

        error: {
            name: err.name,
            message: err.message,
            code: err.code ?? null,
            stack:
                process.env.NODE_ENV === "development"
                    ? err.stack
                    : undefined,
        },
    });
};