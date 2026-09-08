import { broadcastAuditLog } from "./audit.socket.js";

export interface AuditRecord {
  id: string;
  timestamp: string;
  actorName: string;
  actorEmail: string;
  actorRole: string;
  action: string;
  entityType: string;
  entityId: string;
  status: "SUCCESS" | "WARNING" | "FAILED";
  ipAddress: string;
  details: string;
  method?: string;
  path?: string;
  metadata?: Record<string, any>;
  before?: any;
  after?: any;
}

// In-memory buffer storing recent 1000 audit records
const auditLogBuffer: AuditRecord[] = [
  {
    id: "aud-101",
    timestamp: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
    actorName: "Admin User",
    actorEmail: "admin@dev.com",
    actorRole: "ADMIN",
    action: "BOOKING_APPROVED",
    entityType: "Booking",
    entityId: "MIRA-2026-00042",
    status: "SUCCESS",
    ipAddress: "127.0.0.1",
    details: "Approved booking with 30/70 standard staged schedule and confirmed total $4,500 USD.",
    method: "POST",
    path: "/api/v1/bookings/MIRA-2026-00042/approve",
  },
  {
    id: "aud-102",
    timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    actorName: "Admin User",
    actorEmail: "admin@dev.com",
    actorRole: "ADMIN",
    action: "MANUAL_PAYMENT_RECORDED",
    entityType: "PaymentRecord",
    entityId: "rec_99218",
    status: "SUCCESS",
    ipAddress: "127.0.0.1",
    details: "Recorded manual Bank Transfer of $1,350 for Schedule Item Deposit #1.",
    method: "POST",
    path: "/api/v1/payment-records",
  },
  {
    id: "aud-103",
    timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    actorName: "System Auth",
    actorEmail: "admin@dev.com",
    actorRole: "ADMIN",
    action: "AUTH_LOGIN_SUCCESS",
    entityType: "Auth",
    entityId: "auth_admin_1",
    status: "SUCCESS",
    ipAddress: "127.0.0.1",
    details: "Administrator logged in successfully via JWT token issuance.",
    method: "POST",
    path: "/api/v1/auth/login",
  },
  {
    id: "aud-104",
    timestamp: new Date(Date.now() - 1000 * 60 * 240).toISOString(),
    actorName: "Admin User",
    actorEmail: "admin@dev.com",
    actorRole: "ADMIN",
    action: "STORY_PUBLISHED",
    entityType: "Story",
    entityId: "story_kyoto_zen",
    status: "SUCCESS",
    ipAddress: "127.0.0.1",
    details: "Published editorial story 'Kyoto Zen Gardens & Tea Rituals' with full multimedia blocks.",
    method: "PUT",
    path: "/api/v1/stories/story_kyoto_zen",
  },
  {
    id: "aud-105",
    timestamp: new Date(Date.now() - 1000 * 60 * 360).toISOString(),
    actorName: "Admin User",
    actorEmail: "admin@dev.com",
    actorRole: "ADMIN",
    action: "USER_STATUS_UPDATED",
    entityType: "User",
    entityId: "usr_102",
    status: "WARNING",
    ipAddress: "127.0.0.1",
    details: "Modified account status for traveler user2@miratravel.com to ACTIVE.",
    method: "PATCH",
    path: "/api/v1/users/usr_102",
  },
];

export class AuditService {
  /**
   * Record a new audit log and broadcast via WebSocket
   */
  static recordLog(data: Partial<AuditRecord>): AuditRecord {
    const record: AuditRecord = {
      id: data.id || `aud-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: data.timestamp || new Date().toISOString(),
      actorName: data.actorName || "System",
      actorEmail: data.actorEmail || "system@miratravel.com",
      actorRole: data.actorRole || "SYSTEM",
      action: (data.action || "SYSTEM_EVENT").toUpperCase(),
      entityType: data.entityType || "General",
      entityId: data.entityId || "N/A",
      status: data.status || "SUCCESS",
      ipAddress: data.ipAddress || "127.0.0.1",
      details: data.details || "No details provided",
      method: data.method,
      path: data.path,
      metadata: data.metadata,
      before: data.before,
      after: data.after,
    };

    // Prepend to in-memory buffer
    auditLogBuffer.unshift(record);

    // Keep buffer capped at 1000
    if (auditLogBuffer.length > 1000) {
      auditLogBuffer.pop();
    }

    // Broadcast immediately to live socket subscribers
    broadcastAuditLog(record);

    return record;
  }

  /**
   * Query filtered & paginated audit logs
   */
  static getLogs(query: {
    search?: string;
    action?: string;
    entity?: string;
    status?: string;
    limit?: number;
    page?: number;
  }) {
    const { search, action, entity, status, limit = 50, page = 1 } = query;

    let filtered = [...auditLogBuffer];

    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (log) =>
          log.actorEmail.toLowerCase().includes(q) ||
          log.actorName.toLowerCase().includes(q) ||
          log.action.toLowerCase().includes(q) ||
          log.entityId.toLowerCase().includes(q) ||
          log.details.toLowerCase().includes(q) ||
          log.ipAddress.includes(q)
      );
    }

    if (action && action !== "ALL") {
      filtered = filtered.filter((log) =>
        log.action.toLowerCase().includes(action.toLowerCase())
      );
    }

    if (entity && entity !== "ALL") {
      filtered = filtered.filter(
        (log) => log.entityType.toLowerCase() === entity.toLowerCase()
      );
    }

    if (status && status !== "ALL") {
      filtered = filtered.filter((log) => log.status === status);
    }

    const total = filtered.length;
    const startIndex = (Number(page) - 1) * Number(limit);
    const paginated = filtered.slice(startIndex, startIndex + Number(limit));

    return {
      data: paginated,
      meta: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      },
    };
  }

  /**
   * Get audit statistics
   */
  static getStats() {
    const total = auditLogBuffer.length;
    const successCount = auditLogBuffer.filter((l) => l.status === "SUCCESS").length;
    const warningCount = auditLogBuffer.filter((l) => l.status === "WARNING").length;
    const failedCount = auditLogBuffer.filter((l) => l.status === "FAILED").length;

    return {
      total,
      successCount,
      warningCount,
      failedCount,
      successRate: total > 0 ? Math.round((successCount / total) * 100) : 100,
      recentCount24h: total,
    };
  }

  /**
   * Get single log by ID
   */
  static getLogById(id: string) {
    return auditLogBuffer.find((l) => l.id === id) || null;
  }

  /**
   * Clear in-memory audit logs
   */
  static clearLogs() {
    const count = auditLogBuffer.length;
    auditLogBuffer.length = 0;
    return { clearedCount: count };
  }
}
