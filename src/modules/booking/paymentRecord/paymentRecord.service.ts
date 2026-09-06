import prisma from "../../../config/prisma.js";
import ApiError from "../../../utils/api.error.js";
import { getRecords } from "../../../shared/getRecords.service.js";
import { auditLogger } from "../../../logger/audit.logger.js";
import { emailHelper } from "../../../utils/email.helper.js";
import {
  recalculateBookingState,
  round2,
} from "../engine/paymentEngine.service.js";

const recordInclude = {
  booking: {
    select: {
      id: true,
      bookingNumber: true,
      travelerEmail: true,
      currency: true,
    },
  },
  scheduleItem: true,
};

// ---------------------------------------------------------------------------
// LIST
// ---------------------------------------------------------------------------
export const getPaymentRecordService = async (req: any) => {
  const { id, bookingId, scheduleItemId, status } = req.validated.query;

  const customWhere: any = {};
  if (id) customWhere.id = id;
  if (bookingId) customWhere.bookingId = bookingId;
  if (scheduleItemId) customWhere.scheduleItemId = scheduleItemId;
  if (status) customWhere.status = status;

  return getRecords({
    req,
    model: prisma.paymentRecord,
    customWhere,
    modelName: "PaymentRecord",
    include: recordInclude,
    orderBy: { paymentDate: "desc" },
    excludeFilterKeys: [
      "page",
      "limit",
      "id",
      "bookingId",
      "scheduleItemId",
      "status",
    ],
  });
};

// ---------------------------------------------------------------------------
// RECORD a payment — manual (admin, spec §10) or a PSP transaction callback.
// Payment transaction records are append-only (spec §13 rule 82): corrections
// happen via refunds/adjustments, never edits or deletes.
// ---------------------------------------------------------------------------
export const recordPaymentService = async (req: any) => {
  const {
    bookingId,
    scheduleItemId,
    amount,
    currency,
    method,
    pspTransactionRef,
    status,
    paymentDate,
    adminNotes,
  } = req.validated.body;

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      selectedPaymentSchedule: {
        include: { items: { orderBy: { sequence: "asc" } } },
      },
    },
  });
  if (!booking) throw new ApiError("Booking not found", 404);
  if (!booking.selectedPaymentSchedule)
    throw new ApiError("Booking has no active payment schedule", 400);

  const items: any[] = booking.selectedPaymentSchedule.items;
  const targetItem = scheduleItemId
    ? items.find((i: any) => i.id === scheduleItemId)
    : items.find((i: any) =>
        ["SCHEDULED", "DUE", "PENDING"].includes(i.status),
      );

  if (!targetItem)
    throw new ApiError("No eligible schedule item found for this payment", 400);

  const result = await prisma.$transaction(async (tx: any) => {
    const record = await tx.paymentRecord.create({
      data: {
        bookingId,
        scheduleItemId: targetItem.id,
        paymentDate: paymentDate ?? new Date(),
        amount,
        currency: currency ?? booking.currency,
        method: method ?? "manual",
        pspTransactionRef,
        status,
        recordedBy: req.auth.id,
        adminNotes,
      },
    });

    if (status === "SUCCEEDED") {
      const newPaidOnItem = round2(Number(targetItem.paidAmount) + amount);
      const itemFullyPaid =
        newPaidOnItem >= Number(targetItem.calculatedAmount) - 0.01;

      await tx.paymentScheduleItem.update({
        where: { id: targetItem.id },
        data: {
          paidAmount: newPaidOnItem,
          status: itemFullyPaid ? "PAID" : "PENDING",
        },
      });
    } else if (status === "FAILED") {
      // Spec Table 10: keep amount due, store the failed attempt, allow retry — no item/total mutation.
      await tx.paymentScheduleItem.update({
        where: { id: targetItem.id },
        data: { status: "FAILED" },
      });
    }

    const updatedBooking = await recalculateBookingState(bookingId, tx);

    return { record, booking: updatedBooking };
  });

  await auditLogger({
    req,
    entityId: result.record.id,
    before: null,
    after: result.record,
    metadata: {
      source: "database",
      operation: "CREATE",
      bookingId,
      scheduleItemId: targetItem.id,
      status,
    },
  });

  if (status === "SUCCEEDED") {
    emailHelper({
      to: booking.travelerEmail,
      subject: `Payment received — booking ${booking.bookingNumber}`,
      message: `We've received your payment of ${amount} ${currency ?? booking.currency} for booking ${booking.bookingNumber}. Thank you!`,
    }).catch(() => {});
  }

  return {
    code: 201,
    success: true,
    message:
      status === "SUCCEEDED"
        ? "Payment recorded successfully"
        : `Payment recorded with status ${status}`,
    data: result,
  };
};

// ---------------------------------------------------------------------------
// REFUND — full or partial (spec §10, §13 rule 82: never delete, only refund/adjust)
// ---------------------------------------------------------------------------
export const refundPaymentService = async (req: any) => {
  const { id } = req.validated.params;
  const { refundAmount, adminNotes } = req.validated.body;

  const record = await prisma.paymentRecord.findUnique({ where: { id } });
  if (!record) throw new ApiError("Payment record not found", 404);
  if (record.status !== "SUCCEEDED" && record.status !== "PARTIALLY_REFUNDED") {
    throw new ApiError(
      `Only successful payments can be refunded (current status: ${record.status})`,
      400,
    );
  }

  const alreadyRefunded = Number(record.refundAmount ?? 0);
  const refundableRemaining = round2(Number(record.amount) - alreadyRefunded);
  if (refundAmount > refundableRemaining + 0.01) {
    throw new ApiError(
      `Refund amount exceeds refundable balance (${refundableRemaining})`,
      400,
    );
  }

  const newRefundTotal = round2(alreadyRefunded + refundAmount);
  const isFullRefund = newRefundTotal >= Number(record.amount) - 0.01;

  const result = await prisma.$transaction(async (tx: any) => {
    const updatedRecord = await tx.paymentRecord.update({
      where: { id },
      data: {
        refundAmount: newRefundTotal,
        status: isFullRefund ? "REFUNDED" : "PARTIALLY_REFUNDED",
        adminNotes: record.adminNotes
          ? `${record.adminNotes}\n[refund] ${adminNotes}`
          : `[refund] ${adminNotes}`,
      },
    });

    if (record.scheduleItemId) {
      const item = await tx.paymentScheduleItem.findUnique({
        where: { id: record.scheduleItemId },
      });
      if (item) {
        const newPaidOnItem = Math.max(
          0,
          round2(Number(item.paidAmount) - refundAmount),
        );
        await tx.paymentScheduleItem.update({
          where: { id: item.id },
          data: {
            paidAmount: newPaidOnItem,
            status: isFullRefund ? "REFUNDED" : item.status,
          },
        });
      }
    }

    const booking = await recalculateBookingState(record.bookingId, tx);
    return { record: updatedRecord, booking };
  });

  await auditLogger({
    req,
    entityId: id,
    before: record,
    after: result.record,
    metadata: {
      source: "database",
      operation: "REFUND",
      refundAmount,
      adminNotes,
    },
  });

  return {
    code: 200,
    success: true,
    message: "Refund recorded successfully",
    data: result,
  };
};
