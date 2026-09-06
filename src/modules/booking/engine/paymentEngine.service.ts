import prisma from "../../../config/prisma.js";
import ApiError from "../../../utils/api.error.js";

/**
 * Payment Engine
 * ----------------------------------------------------------------------
 * Implements "Mira Travel — Booking & Payment Rules" (v1.0, 30 Aug 2026):
 *   - 5.1 / 5.2 / 5.3  standard consumer payment rule (30/70 vs 100%)
 *   - 6                configurable rules (PaymentConfig, not hardcoded)
 *   - 7                installment plan model (generic schedule items)
 *   - 9                booking-level monetary snapshots
 *   - 13               calculation rules & edge cases
 *
 * Nothing here talks to Express — it is pure domain logic reused by the
 * booking, paymentSchedule and paymentRecord modules.
 */

export const MS_PER_DAY = 1000 * 60 * 60 * 24;

/** Launch defaults from spec §6 / Table 5 — used only when no PaymentConfig row exists yet. */
export const DEFAULT_PAYMENT_CONFIG = {
  scope: "global",
  depositEnabled: true,
  depositType: "PERCENTAGE" as const,
  depositValue: 30,
  finalPaymentDueDaysBeforeDeparture: 60,
  fullPaymentRequiredIfWithinDays: 60,
  allowAdminOverride: true,
  reservationWithoutPayment: false,
};

/** Round to 2 decimal places (currency-safe enough for this domain; DB column is Decimal(10,2)). */
export const round2 = (value: number) =>
  Math.round((value + Number.EPSILON) * 100) / 100;

/** Whole days between two dates (spec §5: "days between approval/payment-request date and departure date"). */
export const daysBetween = (from: Date, to: Date) => {
  const a = Date.UTC(from.getFullYear(), from.getMonth(), from.getDate());
  const b = Date.UTC(to.getFullYear(), to.getMonth(), to.getDate());
  return Math.round((b - a) / MS_PER_DAY);
};

/**
 * Fetch the effective PaymentConfig for a booking.
 * Journey-level override ("journey:<id>") wins over "global" (spec §6: "overridable at product level").
 * Auto-creates the global row with launch defaults on first use so nothing is ever hardcoded silently.
 */
export const getEffectivePaymentConfig = async (journeyId?: string | null) => {
  if (journeyId) {
    const journeyScoped = await prisma.paymentConfig.findUnique({
      where: { scope: `journey:${journeyId}` },
    });
    if (journeyScoped) return journeyScoped;
  }

  const global = await prisma.paymentConfig.findUnique({
    where: { scope: "global" },
  });
  if (global) return global;

  return prisma.paymentConfig.create({ data: DEFAULT_PAYMENT_CONFIG });
};

/** Resolve a schedule item's concrete due date from its due rule (spec Table 6). */
export const resolveDueDate = ({
  dueRule,
  dueValue,
  approvalDate,
  departureDate,
  fixedDate,
}: {
  dueRule:
    | "IMMEDIATE_AFTER_APPROVAL"
    | "DAYS_BEFORE_DEPARTURE"
    | "FIXED_DATE"
    | "MANUAL";
  dueValue?: number | null;
  approvalDate: Date;
  departureDate: Date;
  fixedDate?: Date | null;
}): Date | null => {
  switch (dueRule) {
    case "IMMEDIATE_AFTER_APPROVAL":
      return approvalDate;
    case "DAYS_BEFORE_DEPARTURE": {
      const days = dueValue ?? 0;
      return new Date(departureDate.getTime() - days * MS_PER_DAY);
    }
    case "FIXED_DATE":
      return fixedDate ?? null;
    case "MANUAL":
    default:
      return null;
  }
};

export type GeneratedScheduleItem = {
  sequence: number;
  label: string;
  calculationType: "PERCENTAGE" | "FIXED" | "REMAINDER";
  ruleValue: number | null;
  dueRule:
    | "IMMEDIATE_AFTER_APPROVAL"
    | "DAYS_BEFORE_DEPARTURE"
    | "FIXED_DATE"
    | "MANUAL";
  dueValue: number | null;
  dueDate: Date | null;
  calculatedAmount: number;
};

/**
 * Auto-resolve the applicable payment schedule for a booking at approval time.
 * Implements spec §5.1, §5.2, §5.3 and the fixed-deposit edge case (§13, rule 78).
 */
export const resolvePaymentSchedule = ({
  confirmedTotal,
  approvalDate,
  departureDate,
  config,
}: {
  confirmedTotal: number;
  approvalDate: Date;
  departureDate: Date;
  config: {
    depositEnabled: boolean;
    depositType: string;
    depositValue: number;
    finalPaymentDueDaysBeforeDeparture: number;
    fullPaymentRequiredIfWithinDays: number;
  };
}): {
  templateType: "STANDARD_30_70" | "FULL_PAYMENT" | "FIXED_DEPOSIT";
  items: GeneratedScheduleItem[];
} => {
  const daysUntilDeparture = daysBetween(approvalDate, departureDate);

  // §5.2 / §5.3 — "60 days or less" (inclusive) before departure => 100% due now, no deposit shown.
  const withinFullPaymentWindow =
    daysUntilDeparture <= config.fullPaymentRequiredIfWithinDays;

  if (!config.depositEnabled || withinFullPaymentWindow) {
    return {
      templateType: "FULL_PAYMENT",
      items: [
        {
          sequence: 1,
          label: "Full payment",
          calculationType: "REMAINDER",
          ruleValue: null,
          dueRule: "IMMEDIATE_AFTER_APPROVAL",
          dueValue: null,
          dueDate: approvalDate,
          calculatedAmount: round2(confirmedTotal),
        },
      ],
    };
  }

  // §5.1 — more than the full-payment window before departure.
  if (config.depositType === "FIXED") {
    // Rule 78: if the fixed deposit >= total, fall back to full payment instead of a zero/negative balance.
    if (config.depositValue >= confirmedTotal) {
      return {
        templateType: "FULL_PAYMENT",
        items: [
          {
            sequence: 1,
            label: "Full payment",
            calculationType: "REMAINDER",
            ruleValue: null,
            dueRule: "IMMEDIATE_AFTER_APPROVAL",
            dueValue: null,
            dueDate: approvalDate,
            calculatedAmount: round2(confirmedTotal),
          },
        ],
      };
    }

    const deposit = round2(config.depositValue);
    const remainder = round2(confirmedTotal - deposit);

    return {
      templateType: "FIXED_DEPOSIT",
      items: [
        {
          sequence: 1,
          label: "Deposit",
          calculationType: "FIXED",
          ruleValue: deposit,
          dueRule: "IMMEDIATE_AFTER_APPROVAL",
          dueValue: null,
          dueDate: approvalDate,
          calculatedAmount: deposit,
        },
        {
          sequence: 2,
          label: "Final balance",
          calculationType: "REMAINDER",
          ruleValue: null,
          dueRule: "DAYS_BEFORE_DEPARTURE",
          dueValue: config.finalPaymentDueDaysBeforeDeparture,
          dueDate: resolveDueDate({
            dueRule: "DAYS_BEFORE_DEPARTURE",
            dueValue: config.finalPaymentDueDaysBeforeDeparture,
            approvalDate,
            departureDate,
          }),
          calculatedAmount: remainder,
        },
      ],
    };
  }

  // Default / launch rule: percentage deposit, e.g. 30% now + 70% remainder (§Table 3.A).
  const depositPct = config.depositValue;
  const deposit = round2((confirmedTotal * depositPct) / 100);
  const remainder = round2(confirmedTotal - deposit); // remainder absorbs rounding (spec §7)

  return {
    templateType: "STANDARD_30_70",
    items: [
      {
        sequence: 1,
        label: "Deposit",
        calculationType: "PERCENTAGE",
        ruleValue: depositPct,
        dueRule: "IMMEDIATE_AFTER_APPROVAL",
        dueValue: null,
        dueDate: approvalDate,
        calculatedAmount: deposit,
      },
      {
        sequence: 2,
        label: "Final balance",
        calculationType: "REMAINDER",
        ruleValue: null,
        dueRule: "DAYS_BEFORE_DEPARTURE",
        dueValue: config.finalPaymentDueDaysBeforeDeparture,
        dueDate: resolveDueDate({
          dueRule: "DAYS_BEFORE_DEPARTURE",
          dueValue: config.finalPaymentDueDaysBeforeDeparture,
          approvalDate,
          departureDate,
        }),
        calculatedAmount: remainder,
      },
    ],
  };
};

/**
 * Validate a manually-supplied (admin override / installment plan) set of schedule items.
 * Spec §7 validation rule: sum of all non-waived items must equal the confirmed total,
 * rounding differences absorbed by a REMAINDER item.
 */
export const validateManualScheduleItems = (
  items: {
    calculationType: string;
    ruleValue?: number | null;
    calculatedAmount?: number | null;
  }[],
  confirmedTotal: number,
) => {
  if (!items.length)
    throw new ApiError("A payment schedule needs at least one item", 400);

  const remainderCount = items.filter(
    (i) => i.calculationType === "REMAINDER",
  ).length;
  if (remainderCount > 1)
    throw new ApiError("Only one REMAINDER item is allowed per schedule", 400);

  const nonRemainder = items.filter((i) => i.calculationType !== "REMAINDER");
  const nonRemainderSum = round2(
    nonRemainder.reduce((sum, item) => {
      if (item.calculationType === "PERCENTAGE") {
        return sum + (confirmedTotal * (item.ruleValue ?? 0)) / 100;
      }
      return sum + (item.calculatedAmount ?? item.ruleValue ?? 0);
    }, 0),
  );

  if (
    remainderCount === 0 &&
    Math.abs(nonRemainderSum - confirmedTotal) > 0.01
  ) {
    throw new ApiError(
      `Schedule items must sum to the confirmed total (${confirmedTotal}); got ${nonRemainderSum}`,
      400,
    );
  }

  if (nonRemainderSum > confirmedTotal + 0.01) {
    throw new ApiError(
      "Schedule items exceed the confirmed booking total",
      400,
    );
  }

  return round2(confirmedTotal - nonRemainderSum); // amount for the REMAINDER item, if any
};

/**
 * Recompute a booking's paidAmount / outstandingAmount / paymentStatus / bookingStatus
 * from its ACTIVE payment schedule + payment records. Called after every payment,
 * refund, waiver or schedule change so the two status fields (spec §8) never drift.
 */
export const recalculateBookingState = async (
  bookingId: string,
  tx: any = prisma,
) => {
  const booking = await tx.booking.findUnique({
    where: { id: bookingId },
    include: {
      selectedPaymentSchedule: { include: { items: true } },
      paymentRecords: true,
    },
  });
  if (!booking) throw new ApiError("Booking not found", 404);

  const confirmedTotal = Number(booking.confirmedTotal ?? 0);

  const paidAmount = round2(
    booking.paymentRecords
      .filter(
        (r: any) =>
          r.status === "SUCCEEDED" || r.status === "PARTIALLY_REFUNDED",
      )
      .reduce(
        (sum: number, r: any) =>
          sum + Number(r.amount) - Number(r.refundAmount ?? 0),
        0,
      ),
  );

  const refundedAmount = round2(
    booking.paymentRecords.reduce(
      (sum: number, r: any) => sum + Number(r.refundAmount ?? 0),
      0,
    ),
  );

  const outstandingAmount = Math.max(0, round2(confirmedTotal - paidAmount));

  const items = booking.selectedPaymentSchedule?.items ?? [];
  const hasAnyPaid = items.some((i: any) => i.status === "PAID");
  const allPaid =
    items.length > 0 &&
    items.every((i: any) => i.status === "PAID" || i.status === "WAIVED");
  const anyFailed = items.some((i: any) => i.status === "FAILED");

  // ---- payment status (spec Table 8) ----
  let paymentStatus: string;
  if (refundedAmount > 0 && paidAmount <= 0) paymentStatus = "REFUNDED";
  else if (refundedAmount > 0) paymentStatus = "PARTIALLY_REFUNDED";
  else if (confirmedTotal > 0 && outstandingAmount <= 0.01)
    paymentStatus = "FULLY_PAID";
  else if (allPaid) paymentStatus = "FULLY_PAID";
  else if (anyFailed && paidAmount <= 0) paymentStatus = "FAILED";
  else if (hasAnyPaid && paidAmount < confirmedTotal) {
    const depositItem = items.find((i: any) => i.sequence === 1);
    paymentStatus =
      depositItem?.status === "PAID" ? "DEPOSIT_PAID" : "BALANCE_DUE";
  } else if (paidAmount > 0) paymentStatus = "PARTIALLY_PAID";
  else paymentStatus = "UNPAID";

  // ---- booking status (spec Table 2 / Table 7), only progressed forward automatically ----
  let bookingStatus = booking.bookingStatus;
  const terminal = ["CANCELLED", "REJECTED"];
  if (!terminal.includes(bookingStatus)) {
    if (paymentStatus === "FULLY_PAID") {
      bookingStatus = "CONFIRMED";
    } else if (
      paymentStatus === "DEPOSIT_PAID" ||
      paymentStatus === "PARTIALLY_PAID"
    ) {
      bookingStatus = "DEPOSIT_PAID_TENTATIVE";
    } else if (paymentStatus === "BALANCE_DUE") {
      bookingStatus = "AWAITING_FINAL_PAYMENT";
    }
    // UNPAID / FAILED intentionally do not move the booking status backwards here;
    // it stays wherever the approve / send-payment-request actions last left it.
  }

  return tx.booking.update({
    where: { id: bookingId },
    data: { paidAmount, outstandingAmount, paymentStatus, bookingStatus },
    include: {
      journey: { select: { id: true, title: true, slug: true } },
      selectedPaymentSchedule: { include: { items: true } },
      paymentRecords: true,
    },
  });
};

/** Human-readable, unique booking reference, e.g. MIRA-2026-00042 (spec §9). */
/**
 * Human-readable, unique booking reference.
 * Format: MIRA-YYYYMMDD-00001
 *
 * Example:
 * MIRA-20260831-00001
 * MIRA-20260831-00002
 */
export const generateBookingNumber = async (tx: any = prisma) => {
  const now = new Date();

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  const datePrefix = `MIRA-${year}${month}${day}-`;

  for (let attempt = 0; attempt < 5; attempt++) {
    const count = await tx.booking.count({
      where: {
        bookingNumber: {
          startsWith: datePrefix,
        },
      },
    });

    const sequence = count + 1 + attempt;

    const candidate = `${datePrefix}${String(sequence).padStart(5, "0")}`;

    const exists = await tx.booking.findUnique({
      where: {
        bookingNumber: candidate,
      },
    });

    if (!exists) {
      return candidate;
    }
  }

  // Extremely unlikely fallback for concurrent writes
  return `${datePrefix}${Date.now()}`;
};
