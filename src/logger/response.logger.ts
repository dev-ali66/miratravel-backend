import { NextFunction, Request, Response } from "express";
import { logger } from "./logger.logger.js";

export const responseLogger = (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    const startedAt = process.hrtime.bigint();

    const originalJson = res.json.bind(res);

    res.json = (body: any) => {
        const duration =
            Number(process.hrtime.bigint() - startedAt) / 1_000_000;

        const responseSize = Buffer.byteLength(
            JSON.stringify(body ?? {}),
            "utf8",
        );

        const responseSizeKB = (responseSize / 1024).toFixed(2);
        const level =
            res.statusCode >= 500
                ? "error"
                : res.statusCode >= 400
                    ? "warn"
                    : "success";

        logger[level]("Outgoing Response", {
            request: {
                id: (req as any).requestId ?? null,
                correlationId: (req as any).correlationId ?? null,
                traceId: (req as any).traceId ?? null,

                method: req.method,
                url: req.originalUrl,
                ip: req.ip,
            },

            user: {
                id: req.auth?.id ?? null,
                role:
                    req.auth?.roles?.map((role: any) => ({
                        id: role.id,
                        name: role.name,
                    })) ?? [],
            },

            response: {
                statusCode: res.statusCode,
                success: body?.success ?? null,
                message: body?.message ?? null,

                meta: body?.meta ?? null,

                dataCount: Array.isArray(body?.data)
                    ? body.data.length
                    : body?.data
                        ? 1
                        : 0,

                duration: `${duration.toFixed(2)} ms`,
                size: `${responseSizeKB} KB`,
            },
        });

        return originalJson(body);
    };

    next();
};