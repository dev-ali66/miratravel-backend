import prisma from "../../../config/prisma.js";
import { auditLogger } from "../../../logger/audit.logger.js";
import { DEFAULT_PAYMENT_CONFIG } from "../engine/paymentEngine.service.js";

// ---------------------------------------------------------------------------
// GET — returns the config for a scope, auto-creating "global" with launch
// defaults (spec Table 5) the first time it's requested so nothing is ever
// silently hardcoded (spec §6: "Configurable rules - do not hardcode").
// ---------------------------------------------------------------------------
export const getPaymentConfigService = async (req: any) => {
  const scope = req.validated.query.scope || "global";

  let config = await prisma.paymentConfig.findUnique({ where: { scope } });

  if (!config && scope === "global") {
    config = await prisma.paymentConfig.create({ data: DEFAULT_PAYMENT_CONFIG });
  }

  return {
    code: 200,
    success: true,
    message: config ? "Payment configuration fetched successfully" : "No override configured for this scope (falls back to global)",
    data: config,
  };
};

// ---------------------------------------------------------------------------
// UPSERT — create or update the config for a scope (global or "journey:<id>")
// ---------------------------------------------------------------------------
export const upsertPaymentConfigService = async (req: any) => {
  const { scope, ...rest } = req.validated.body;

  const existing = await prisma.paymentConfig.findUnique({ where: { scope } });

  const config = await prisma.paymentConfig.upsert({
    where: { scope },
    create: { ...DEFAULT_PAYMENT_CONFIG, scope, ...rest },
    update: rest,
  });

  await auditLogger({
    req,
    entityId: config.id,
    before: existing,
    after: config,
    metadata: { source: "database", operation: existing ? "UPDATE" : "CREATE" },
  });

  return { code: 200, success: true, message: "Payment configuration saved successfully", data: config };
};
