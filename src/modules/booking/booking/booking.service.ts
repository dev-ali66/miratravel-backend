import prisma from "../../../config/prisma.js";
import ApiError from "../../../utils/api.error.js";
import { getRecords } from "../../../shared/getRecords.service.js";
import { deleteRecordsSafely } from "../../../shared/delete.service.js";
import { auditLogger } from "../../../logger/audit.logger.js";
import { emailHelper } from "../../../utils/email.helper.js";
import {
  generateBookingNumber,
  getEffectivePaymentConfig,
  recalculateBookingState,
  resolvePaymentSchedule,
  round2,
  validateManualScheduleItems,
} from "../engine/paymentEngine.service.js";

const bookingInclude = {
  journey: {
    select: { id: true, title: true, slug: true, price: true, currency: true },
  },
  selectedPaymentSchedule: { include: { items: true } },
  paymentSchedules: { include: { items: true } },
  paymentRecords: true,
};

// ---------------------------------------------------------------------------
// LIST
// ---------------------------------------------------------------------------
export const getBookingService = async (req: any) => {
  const {
    id,
    journeyId,
    bookingStatus,
    paymentStatus,
    bookingNumber,
    travelerEmail,
    travelerName,
    travelerType,
    search,
    departureFrom,
    departureTo,
    dueBefore,
  } = req.validated.query;

  const customWhere: any = {};
  if (id) customWhere.id = id;
  if (journeyId) customWhere.journeyId = journeyId;
  if (bookingStatus) customWhere.bookingStatus = bookingStatus;
  if (paymentStatus) customWhere.paymentStatus = paymentStatus;
  if (bookingNumber)
    customWhere.bookingNumber = {
      contains: bookingNumber,
      mode: "insensitive",
    };
  if (travelerEmail)
    customWhere.travelerEmail = {
      contains: travelerEmail,
      mode: "insensitive",
    };
  if (travelerType) customWhere.travelerType = travelerType;
  if (travelerName) {
    customWhere.OR = [
      { travelerFirstName: { contains: travelerName, mode: "insensitive" } },
      { travelerLastName: { contains: travelerName, mode: "insensitive" } },
    ];
  }

  if (departureFrom || departureTo) {
    customWhere.travelDepartureDate = {
      ...(departureFrom ? { gte: departureFrom } : {}),
      ...(departureTo ? { lte: departureTo } : {}),
    };
  }

  if (dueBefore) {
    customWhere.selectedPaymentSchedule = {
      is: {
        items: {
          some: {
            status: { in: ["SCHEDULED", "DUE", "PENDING"] },
            dueDate: { lte: dueBefore },
          },
        },
      },
    };
  }

  if (search) {
    const tokens = [...new Set(String(search).split(/\s+/).filter(Boolean))];
    customWhere.AND = tokens.map((token) => ({
      OR: [
        { bookingNumber: { contains: token, mode: "insensitive" } },
        { travelerFirstName: { contains: token, mode: "insensitive" } },
        { travelerLastName: { contains: token, mode: "insensitive" } },
        { travelerEmail: { contains: token, mode: "insensitive" } },
        { travelerPhone: { contains: token, mode: "insensitive" } },
        {
          journey: {
            is: {
              OR: [
                { title: { contains: token, mode: "insensitive" } },
                { slug: { contains: token, mode: "insensitive" } },
              ],
            },
          },
        },
      ],
    }));
  }

  return getRecords({
    req,
    model: prisma.booking,
    customWhere,
    modelName: "Booking",
    include: bookingInclude,
    orderBy: { createdAt: "desc" },
    excludeFilterKeys: [
      "page",
      "limit",
      "id",
      "journeyId",
      "bookingStatus",
      "paymentStatus",
      "bookingNumber",
      "travelerEmail",
      "travelerName",
      "travelerType",
      "search",
      "departureFrom",
      "departureTo",
      "dueBefore",
    ],
  });
};

// ---------------------------------------------------------------------------
// CREATE — customer submits a travel/booking request (spec §3 step 1, §11)
// ---------------------------------------------------------------------------
export const createBookingRequestService = async (req: any) => {
  const data = req.validated.body;

  const journey = await prisma.journey.findUnique({
    where: { id: data.journeyId },
  });
  if (!journey) throw new ApiError("Journey not found", 404);
  if (journey.status !== "PUBLISHED")
    throw new ApiError("This journey is not open for booking requests", 400);

  if (data.addOnIds?.length) {
    // Addons are stored in journey JSON data
  }

  const bookingNumber = await generateBookingNumber();

  const booking = await prisma.booking.create({
    data: {
      bookingNumber,
      journeyId: journey.id,
      createdBy: req.auth?.id ?? null,
      travelerFirstName: data.travelerFirstName,
      travelerLastName: data.travelerLastName,
      travelerEmail: data.travelerEmail,
      travelerPhone: data.travelerPhone,
      travelerNationality: data.travelerNationality,
      travelerBirthDate: data.travelerBirthDate,
      travelArrivalDate: data.travelArrivalDate,
      travelDepartureDate: data.travelDepartureDate,
      addOnIds: data.addOnIds ?? [],
      travelerMessage: data.travelerMessage,
      travelerType: data.travelerType ?? "SOLO",
      adults: data.adults,
      children: data.children ?? 0,
      childrenAges: data.childrenAges ?? [],
      currency: data.currency ?? journey.currency,
      agreedToTerms: data.agreedToTerms,
      agreedToPrivacyPolicy: data.agreedToPrivacyPolicy,
      acknowledgedRequestOnly: data.acknowledgedRequestOnly,
      consentTimestamp: new Date(),
      bookingStatus: "REQUEST_SUBMITTED",
      paymentStatus: "UNPAID",
    },
    include: bookingInclude,
  });

  await auditLogger({
    req,
    entityId: booking.id,
    before: null,
    after: booking,
    metadata: { source: "database", operation: "CREATE" },
  });

  return {
    code: 201,
    success: true,
    message:
      "Booking request submitted successfully. No payment is required at this stage.",
    data: booking,
  };
};

// ---------------------------------------------------------------------------
// UPDATE — admin edits traveler/logistics details pre-approval
// ---------------------------------------------------------------------------
export const updateBookingService = async (req: any) => {
  const { id } = req.validated.params;
  const data = req.validated.body;

  const existing = await prisma.booking.findUnique({ where: { id } });
  if (!existing) throw new ApiError("Booking not found", 404);

  if (!["REQUEST_SUBMITTED", "UNDER_REVIEW"].includes(existing.bookingStatus)) {
    throw new ApiError(
      "Booking details can only be edited before approval",
      400,
    );
  }

  const updated = await prisma.booking.update({
    where: { id },
    data,
    include: bookingInclude,
  });

  await auditLogger({
    req,
    entityId: id,
    before: existing,
    after: updated,
    metadata: { source: "database", operation: "UPDATE" },
  });

  return {
    code: 200,
    success: true,
    message: "Booking updated successfully",
    data: updated,
  };
};

// ---------------------------------------------------------------------------
// APPROVE — spec §3 step 3 / §5 / §7: determine & generate the payment schedule
// ---------------------------------------------------------------------------
export const approveBookingService = async (req: any) => {
  const { id } = req.validated.params;
  const {
    confirmedTotal: confirmedTotalInput,
    currency,
    scheduleOverride,
  } = req.validated.body ?? {};

  const booking = await prisma.booking.findUnique({
    where: { id },
    include: { journey: true },
  });
  if (!booking) throw new ApiError("Booking not found", 404);
  if (!["REQUEST_SUBMITTED", "UNDER_REVIEW"].includes(booking.bookingStatus)) {
    throw new ApiError(
      `Booking cannot be approved from status ${booking.bookingStatus}`,
      400,
    );
  }

  // §13 rule 77: use the final approved total after supplements/add-ons/discounts.
  // If admin doesn't pass one explicitly, estimate from journey price + selected add-ons as a starting point.
  let confirmedTotal = confirmedTotalInput;
  if (confirmedTotal === undefined) {
    const addOns: any[] = [];
    const addOnsTotal = 0;
    confirmedTotal = round2(Number(booking.journey.price) + addOnsTotal);
  }

  const approvalDate = new Date();
  const bookingCurrency =
    currency ?? booking.currency ?? booking.journey.currency;

  const config = await getEffectivePaymentConfig(booking.journeyId);

  let templateType:
    | "STANDARD_30_70"
    | "FULL_PAYMENT"
    | "FIXED_DEPOSIT"
    | "INSTALLMENT_PLAN";
  let items: {
    sequence: number;
    label: string;
    calculationType: string;
    ruleValue: number | null;
    dueRule: string;
    dueValue: number | null;
    dueDate: Date | null;
    calculatedAmount: number;
  }[];
  let overrideReason: string | null = null;

  if (scheduleOverride) {
    if (!config.allowAdminOverride)
      throw new ApiError(
        "Admin override of payment schedules is disabled in payment configuration",
        403,
      );

    const remainderAmount = validateManualScheduleItems(
      scheduleOverride.items,
      confirmedTotal,
    );
    templateType = "INSTALLMENT_PLAN";
    overrideReason = scheduleOverride.overrideReason;
    items = scheduleOverride.items.map((item: any, index: number) => {
      const calculatedAmount =
        item.calculationType === "REMAINDER"
          ? remainderAmount
          : item.calculationType === "PERCENTAGE"
            ? round2((confirmedTotal! * item.ruleValue) / 100)
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
            ? (item.fixedDate ?? null)
            : item.dueRule === "IMMEDIATE_AFTER_APPROVAL"
              ? approvalDate
              : item.dueRule === "DAYS_BEFORE_DEPARTURE"
                ? new Date(
                    booking.travelDepartureDate.getTime() -
                      (item.dueValue ?? 0) * 86400000,
                  )
                : null,
        calculatedAmount,
      };
    });
  } else {
    const resolved = resolvePaymentSchedule({
      confirmedTotal,
      approvalDate,
      departureDate: booking.travelDepartureDate,
      config: { ...config, depositValue: Number(config.depositValue) },
    });
    templateType = resolved.templateType;
    items = resolved.items;
  }

  const result = await prisma.$transaction(async (tx: any) => {
    // Supersede any previous ACTIVE schedule (e.g. re-approval after a rejection was reversed).
    await tx.paymentSchedule.updateMany({
      where: { bookingId: id, status: "ACTIVE" },
      data: { status: "SUPERSEDED" },
    });

    const schedule = await tx.paymentSchedule.create({
      data: {
        bookingId: id,
        templateType,
        totalScheduledAmount: confirmedTotal,
        status: "ACTIVE",
        overrideReason,
        createdBy: req.auth.id,
        items: { create: items },
      },
      include: { items: true },
    });

    const updatedBooking = await tx.booking.update({
      where: { id },
      data: {
        confirmedTotal,
        currency: bookingCurrency,
        approvalDate,
        bookingStatus: "APPROVED",
        selectedPaymentScheduleId: schedule.id,
        outstandingAmount: confirmedTotal,
      },
      include: bookingInclude,
    });

    return { schedule, booking: updatedBooking };
  });

  await auditLogger({
    req,
    entityId: id,
    before: booking,
    after: result.booking,
    metadata: {
      source: "database",
      operation: "APPROVE",
      templateType,
      confirmedTotal,
      scheduleId: result.schedule.id,
    },
  });

  return {
    code: 200,
    success: true,
    message: "Booking approved and payment schedule generated",
    data: result.booking,
  };
};

// ---------------------------------------------------------------------------
// REJECT
// ---------------------------------------------------------------------------
export const rejectBookingService = async (req: any) => {
  const { id } = req.validated.params;
  const { reason } = req.validated.body;

  const booking = await prisma.booking.findUnique({ where: { id } });
  if (!booking) throw new ApiError("Booking not found", 404);
  if (!["REQUEST_SUBMITTED", "UNDER_REVIEW"].includes(booking.bookingStatus)) {
    throw new ApiError(
      `Booking cannot be rejected from status ${booking.bookingStatus}`,
      400,
    );
  }

  const updated = await prisma.booking.update({
    where: { id },
    data: { bookingStatus: "REJECTED" },
    include: bookingInclude,
  });

  await auditLogger({
    req,
    entityId: id,
    before: booking,
    after: updated,
    metadata: { source: "database", operation: "REJECT", reason },
  });

  emailHelper({
    to: booking.travelerEmail,
    subject: `Your Mira Travel request ${booking.bookingNumber}`,
    message: `We're sorry — we're unable to accept your travel request at this time. Reason: ${reason}`,
  }).catch(() => {});

  return {
    code: 200,
    success: true,
    message: "Booking rejected",
    data: updated,
  };
};

// ---------------------------------------------------------------------------
// CANCEL — admin (or an approval-time reversal) cancels a booking
// ---------------------------------------------------------------------------
export const cancelBookingService = async (req: any) => {
  const { id } = req.validated.params;
  const { reason } = req.validated.body;

  const booking = await prisma.booking.findUnique({ where: { id } });
  if (!booking) throw new ApiError("Booking not found", 404);
  if (["CANCELLED", "REJECTED"].includes(booking.bookingStatus)) {
    throw new ApiError("Booking is already cancelled or rejected", 400);
  }

  const updated = await prisma.$transaction(async (tx: any) => {
    await tx.paymentSchedule.updateMany({
      where: { bookingId: id, status: "ACTIVE" },
      data: { status: "CANCELLED" },
    });
    return tx.booking.update({
      where: { id },
      data: { bookingStatus: "CANCELLED" },
      include: bookingInclude,
    });
  });

  await auditLogger({
    req,
    entityId: id,
    before: booking,
    after: updated,
    metadata: { source: "database", operation: "CANCEL", reason },
  });

  return {
    code: 200,
    success: true,
    message:
      booking.paidAmount && Number(booking.paidAmount) > 0
        ? "Booking cancelled. Any refund must be recorded separately via the payment-records refund endpoint."
        : "Booking cancelled",
    data: updated,
  };
};

// ---------------------------------------------------------------------------
// REVISE TOTAL — spec §13 rule 79: admin revises total after partial payment
// ---------------------------------------------------------------------------
export const reviseBookingTotalService = async (req: any) => {
  const { id } = req.validated.params;
  const { newConfirmedTotal, reason } = req.validated.body;

  const booking = await prisma.booking.findUnique({
    where: { id },
    include: { selectedPaymentSchedule: { include: { items: true } } },
  });
  if (!booking) throw new ApiError("Booking not found", 404);
  if (!booking.selectedPaymentSchedule)
    throw new ApiError("Booking has no active payment schedule to revise", 400);

  const items: any[] = booking.selectedPaymentSchedule.items;
  const paidItems = items.filter((i: any) => i.status === "PAID");
  const unpaidItems = items.filter(
    (i: any) => i.status !== "PAID" && i.status !== "WAIVED",
  );

  const paidSoFar = round2(
    paidItems.reduce((s: number, i: any) => s + Number(i.paidAmount), 0),
  );
  if (newConfirmedTotal < paidSoFar) {
    throw new ApiError(
      `New total (${newConfirmedTotal}) cannot be less than the amount already paid (${paidSoFar})`,
      400,
    );
  }
  if (!unpaidItems.length) {
    throw new ApiError(
      "All schedule items are already paid or waived — nothing to recalculate",
      400,
    );
  }

  const newRemainingTotal = round2(newConfirmedTotal - paidSoFar);
  const originalUnpaidSum = round2(
    unpaidItems.reduce(
      (s: number, i: any) => s + Number(i.calculatedAmount),
      0,
    ),
  );

  const result = await prisma.$transaction(async (tx: any) => {
    // Distribute the new remaining total across unpaid items, preserving their original ratio;
    // the last unpaid item absorbs the rounding remainder (mirrors the REMAINDER convention in §7).
    let runningSum = 0;
    for (let i = 0; i < unpaidItems.length; i++) {
      const item = unpaidItems[i];
      const isLast = i === unpaidItems.length - 1;
      const ratio =
        originalUnpaidSum > 0
          ? Number(item.calculatedAmount) / originalUnpaidSum
          : 1 / unpaidItems.length;
      const newAmount = isLast
        ? round2(newRemainingTotal - runningSum)
        : round2(newRemainingTotal * ratio);
      runningSum = round2(runningSum + newAmount);

      await tx.paymentScheduleItem.update({
        where: { id: item.id },
        data: { calculatedAmount: Math.max(0, newAmount) },
      });
    }

    await tx.paymentSchedule.update({
      where: { id: booking.selectedPaymentSchedule!.id },
      data: { totalScheduledAmount: newConfirmedTotal, overrideReason: reason },
    });

    await tx.booking.update({
      where: { id },
      data: { confirmedTotal: newConfirmedTotal },
    });

    return recalculateBookingState(id, tx);
  });

  await auditLogger({
    req,
    entityId: id,
    before: booking,
    after: result,
    metadata: {
      source: "database",
      operation: "REVISE_TOTAL",
      reason,
      previousTotal: Number(booking.confirmedTotal),
      newConfirmedTotal,
    },
  });

  return {
    code: 200,
    success: true,
    message: "Booking total revised; unpaid schedule items recalculated",
    data: result,
  };
};

// ---------------------------------------------------------------------------
// DELETE — only for bookings that never reached a payment stage
// ---------------------------------------------------------------------------
export const deleteBookingService = async (req: any) => {
  const rawIds = Array.isArray(req.body.id) ? req.body.id : [req.body.id];
  const nonDeletable = await prisma.booking.count({
    where: { id: { in: rawIds }, paymentStatus: { not: "UNPAID" } },
  });
  if (nonDeletable > 0) {
    throw new ApiError(
      "Bookings with recorded payments cannot be deleted — cancel them instead",
      400,
    );
  }

  return deleteRecordsSafely({
    res: undefined,
    req,
    prisma,
    model: prisma.booking,
    modelName: "booking",
    softDelete: true,
    rawIds: req.body.id,
    externalDomain: [],
    maxLimit: 10,
    txClient: prisma,
  });
};
