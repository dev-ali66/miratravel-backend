// src/logger/audit.logger.ts

interface AuditLoggerOptions {
    req: any;
    action?: string | null | undefined
    entity?: string | null | undefined
    entityId?: string | number;
    before?: any;
    after?: any;
    metadata?: Record<string, any>;
}

export const auditLogger = async ({
    req,
    action = null,
    entity = null,
    entityId,
    before = null,
    after = null,
    metadata = {},
}: AuditLoggerOptions) => {
    try {
        const auditData = {
            user: {
                id: req.user?.id ?? null,
                role:
                    req.user?.roles?.map((role: any) => ({
                        id: role.id,
                        name: role.name,
                    })) ?? [],
            },

            action: req.action || action,

            entity: req.modelName || entity,

            entityId: entityId?.toString() ?? null,

            before,

            after,

            ip: req.ip,

            userAgent: req.get("user-agent"),

            method: req.method,

            path: req.originalUrl,

            requestId: req.requestId ?? null,

            metadata,

            createdAt: new Date(),
        };

        // TODO: Save audit log to database
        // await prisma.auditLog.create({
        //   data: auditData,
        // });

        console.log("📝 Audit Log:", auditData);
    } catch (error) {
        // Audit failure should never stop the main request
        console.error("Audit Logger Error:", error);
    }
};