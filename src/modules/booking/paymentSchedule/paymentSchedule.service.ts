import prisma from "../../../config/prisma.js";
import config from "../../../config/index.js";
import ApiError from "../../../utils/api.error.js";
import { getRecords } from "../../../shared/getRecords.service.js";
import { auditLogger } from "../../../logger/audit.logger.js";
import { emailHelper } from "../../../utils/email.helper.js";
import {
  getEffectivePaymentConfig,
  recalculateBookingState,
  round2,
  validateManualScheduleItems,
} from "../engine/paymentEngine.service.js";

const scheduleInclude = {
  items: { orderBy: { sequence: "asc" as const } },
  booking: { select: { id: true, bookingNumber: true, travelerEmail: true, travelDepartureDate: true } },
};

// ---------------------------------------------------------------------------
// LIST
// ---------------------------------------------------------------------------
export const getPaymentScheduleService = async (req: any) => {
  const { id, bookingId, status } = req.validated.query;

  const customWhere: any = {};
  if (id) customWhere.id = id;
  if (bookingId) customWhere.bookingId = bookingId;
  if (status) customWhere.status = status;

  return getRecords({
    req,
    model: prisma.paymentSchedule,
    customWhere,
    modelName: "PaymentSchedule",
    include: scheduleInclude,
    orderBy: { createdAt: "desc" },
    excludeFilterKeys: ["page", "limit", "id", "bookingId", "status"],
  });
};

// ---------------------------------------------------------------------------
// OVERRIDE — admin replaces the ACTIVE schedule with a custom set of items (spec §10)
// ---------------------------------------------------------------------------
export const overridePaymentScheduleService = async (req: any) => {
  const { bookingId, overrideReason, items } = req.validated.body;

  const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
  if (!booking) throw new ApiError("Booking not found", 404);
  if (!booking.confirmedTotal) throw new ApiError("Booking must be approved (confirmed total set) before a schedule can be created", 400);
  if (!["APPROVED", "AWAITING_DEPOSIT", "DEPOSIT_PAID_TENTATIVE", "AWAITING_FINAL_PAYMENT"].includes(booking.bookingStatus)) {
    throw new ApiError(`Cannot override schedule while booking is ${booking.bookingStatus}`, 400);
  }

  const config = await getEffectivePaymentConfig(booking.journeyId);
  if (!config.allowAdminOverride) throw new ApiError("Admin override of payment schedules is disabled in payment configuration", 403);

  const confirmedTotal = Number(booking.confirmedTotal);
  const remainderAmount = validateManualScheduleItems(items, confirmedTotal);

  const result = await prisma.$transaction(async (tx: any) => {
    await tx.paymentSchedule.updateMany({ where: { bookingId, status: "ACTIVE" }, data: { status: "SUPERSEDED" } });

    const schedule = await tx.paymentSchedule.create({
      data: {
        bookingId,
        templateType: "INSTALLMENT_PLAN",
        totalScheduledAmount: confirmedTotal,
        status: "ACTIVE",
        overrideReason,
        createdBy: req.auth.id,
        items: {
          create: items.map((item: any, index: number) => {
            const calculatedAmount =
              item.calculationType === "REMAINDER"
                ? remainderAmount
                : item.calculationType === "PERCENTAGE"
                  ? round2((confirmedTotal * item.ruleValue) / 100)
                  : round2(item.ruleValue ?? 0);

            return {
              sequence: index + 1,
              label: item.label,
              calculationType: item.calculationType,
              ruleValue: item.ruleValue ?? null,
              dueRule: item.dueRule,
              dueValue: item.dueValue ?? null,
              dueDate:
                item.dueRule === "FIXED_DATE"
                  ? item.fixedDate ?? null
                  : item.dueRule === "IMMEDIATE_AFTER_APPROVAL"
                    ? new Date()
                    : item.dueRule === "DAYS_BEFORE_DEPARTURE"
                      ? new Date(booking.travelDepartureDate.getTime() - (item.dueValue ?? 0) * 86400000)
                      : null,
              calculatedAmount,
            };
          }),
        },
      },
      include: { items: true },
    });

    await tx.booking.update({ where: { id: bookingId }, data: { selectedPaymentScheduleId: schedule.id } });

    return recalculateBookingState(bookingId, tx);
  });

  await auditLogger({ req, entityId: bookingId, before: booking, after: result, metadata: { source: "database", operation: "OVERRIDE_SCHEDULE", overrideReason } });

  return { code: 200, success: true, message: "Payment schedule overridden successfully", data: result };
};

// ---------------------------------------------------------------------------
// WAIVE — spec §10: "Cancel/waive a schedule item only with an audit trail and
// recalculation/confirmation of the remaining total."
// ---------------------------------------------------------------------------
export const waiveScheduleItemService = async (req: any) => {
  const { itemId } = req.validated.params;
  const { reason } = req.validated.body;

  const item = await prisma.paymentScheduleItem.findUnique({
    where: { id: itemId },
    include: { schedule: { include: { booking: true } } },
  });
  if (!item) throw new ApiError("Schedule item not found", 404);
  if (item.status === "PAID") throw new ApiError("A fully paid item cannot be waived", 400);
  if (item.status === "WAIVED") throw new ApiError("Item is already waived", 400);

  const outstandingOnItem = round2(Number(item.calculatedAmount) - Number(item.paidAmount));

  const result = await prisma.$transaction(async (tx: any) => {
    await tx.paymentScheduleItem.update({ where: { id: itemId }, data: { status: "WAIVED" } });

    const booking = item.schedule.booking;
    const newConfirmedTotal = round2(Number(booking.confirmedTotal ?? 0) - outstandingOnItem);

    await tx.booking.update({ where: { id: booking.id }, data: { confirmedTotal: newConfirmedTotal } });
    await tx.paymentSchedule.update({
      where: { id: item.scheduleId },
      data: { totalScheduledAmount: newConfirmedTotal },
    });

    return recalculateBookingState(booking.id, tx);
  });

  await auditLogger({
    req,
    entityId: itemId,
    before: item,
    after: result,
    metadata: { source: "database", operation: "WAIVE_SCHEDULE_ITEM", reason, waivedAmount: outstandingOnItem },
  });

  return { code: 200, success: true, message: "Schedule item waived and booking total recalculated", data: result };
};

// ---------------------------------------------------------------------------
// SEND PAYMENT REQUEST — spec §3 step 4 / Table 10
// ---------------------------------------------------------------------------
export const sendPaymentRequestService = async (req: any) => {
  const { bookingId, scheduleItemId } = req.validated.body;

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { selectedPaymentSchedule: { include: { items: { orderBy: { sequence: "asc" } } } } },
  });
  if (!booking) throw new ApiError("Booking not found", 404);
  if (!booking.selectedPaymentSchedule) throw new ApiError("Booking has no active payment schedule", 400);

  const items: any[] = booking.selectedPaymentSchedule.items;
  const targetItem = scheduleItemId
    ? items.find((i: any) => i.id === scheduleItemId)
    : items.find((i: any) => ["SCHEDULED", "DUE"].includes(i.status));

  if (!targetItem) throw new ApiError("No eligible unpaid schedule item found to send a request for", 400);
  if (targetItem.status === "PAID" || targetItem.status === "WAIVED") {
    throw new ApiError(`Schedule item is already ${targetItem.status.toLowerCase()}`, 400);
  }

  const baseUrl = (config as any).OTP_BASE_URL || config.CORS_ALLOWED_ORIGINS?.[0] || "https://miratravel.com";
  const paymentLink = `${baseUrl}/pay/${booking.id}/${targetItem.id}`;

  const isFirstItem = targetItem.sequence === 1;

  const result = await prisma.$transaction(async (tx: any) => {
    await tx.paymentScheduleItem.update({ where: { id: targetItem.id }, data: { status: "DUE" } });
    return tx.booking.update({
      where: { id: bookingId },
      data: { bookingStatus: isFirstItem ? "AWAITING_DEPOSIT" : "AWAITING_FINAL_PAYMENT" },
      include: { selectedPaymentSchedule: { include: { items: true } } },
    });
  });

  await emailHelper({
    to: booking.travelerEmail,
    subject: `Payment request for booking ${booking.bookingNumber}`,
    message: `An amount of ${targetItem.calculatedAmount} ${booking.currency} is now due for your booking ${booking.bookingNumber}. Pay securely here: ${paymentLink}`,
    html: `<p>An amount of <strong>${targetItem.calculatedAmount} ${booking.currency}</strong> is now due for your booking <strong>${booking.bookingNumber}</strong>.</p><p><a href="${paymentLink}">Pay securely now</a></p>`,
  }).catch(() => {});

  await auditLogger({
    req,
    entityId: bookingId,
    before: booking,
    after: result,
    metadata: { source: "database", operation: "SEND_PAYMENT_REQUEST", scheduleItemId: targetItem.id, paymentLink },
  });

  return { code: 200, success: true, message: "Payment request sent", data: { booking: result, paymentLink, scheduleItemId: targetItem.id } };
};

// ---------------------------------------------------------------------------
// DUE OVERVIEW — spec §10 "view ... next due date and overdue items at a glance"
// ---------------------------------------------------------------------------
export const getDueOverviewService = async (req: any) => {
  const { dueBefore, withinDays } = req.validated.query;

  const now = new Date();
  const upperBound = dueBefore ?? (withinDays ? new Date(now.getTime() + withinDays * 86400000) : now);

  const items = await prisma.paymentScheduleItem.findMany({
    where: {
      status: { in: ["SCHEDULED", "DUE", "PENDING"] },
      dueDate: { lte: upperBound },
    },
    orderBy: { dueDate: "asc" },
    include: {
      schedule: {
        include: {
          booking: {
            select: { id: true, bookingNumber: true, travelerFirstName: true, travelerLastName: true, travelerEmail: true, currency: true, travelDepartureDate: true, bookingStatus: true },
          },
        },
      },
    },
  });

  const overdue = items.filter((i: any) => i.dueDate && i.dueDate < now);
  const upcoming = items.filter((i: any) => !i.dueDate || i.dueDate >= now);

  return {
    code: 200,
    success: true,
    message: `${items.length} schedule item(s) due`,
    data: { overdue, upcoming },
  };
};
