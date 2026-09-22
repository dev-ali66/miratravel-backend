import { AuditService } from "../modules/audit/audit.service.js";

interface AuditLoggerOptions {
  req: any;
  action?: string | null | undefined;
  entity?: string | null | undefined;
  entityId?: string | number;
  before?: any;
  after?: any;
  metadata?: Record<string, any>;
  status?: "SUCCESS" | "WARNING" | "FAILED";
}

export const auditLogger = async ({
  req,
  action = null,
  entity = null,
  entityId,
  before = null,
  after = null,
  metadata = {},
  status = "SUCCESS",
}: AuditLoggerOptions) => {
  try {
    const user = req.user || req.auth || {};
    const actorRole = Array.isArray(user.roles)
      ? user.roles.map((r: any) => r.name || r).join(", ")
      : (user.role || user.roles || "ADMIN");

    const actorEmail = user.email || "admin@dev.com";
    const actorName = user.name || (user.firstName ? `${user.firstName} ${user.lastName || ""}`.trim() : actorEmail.split("@")[0]);

    const resolvedAction = String(req.action || action || "SYSTEM_EVENT").toUpperCase();
    const resolvedEntity = String(req.modelName || entity || "System");
    const resolvedEntityId = entityId?.toString() ?? "N/A";

    const auditData = {
      actorName,
      actorEmail,
      actorRole,
      action: resolvedAction,
      entityType: resolvedEntity,
      entityId: resolvedEntityId,
      status,
      ipAddress: req.ip || "127.0.0.1",
      details:
        metadata?.description ||
        `${resolvedAction} performed on ${resolvedEntity}${resolvedEntityId !== "N/A" ? ` (${resolvedEntityId})` : ""}`,
      method: req.method,
      path: req.originalUrl,
      metadata,
      before,
      after,
      timestamp: new Date().toISOString(),
    };

    // Store in Audit Service & broadcast to live WebSocket terminal
    AuditService.recordLog(auditData);

    // console.log("📝 Audit Log [Live Broadcast]:", auditData.action, "by", auditData.actorEmail);
  } catch (error) {
    // Audit failure should never stop the main request
    console.error("Audit Logger Error:", error);
  }
};
