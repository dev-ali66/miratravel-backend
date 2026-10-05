import { z } from "zod";

export const BookingStatusEnum = z.enum([
  "REQUEST_SUBMITTED",
  "UNDER_REVIEW",
  "APPROVED",
  "AWAITING_DEPOSIT",
  "DEPOSIT_PAID_TENTATIVE",
  "AWAITING_FINAL_PAYMENT",
  "FULLY_PAID",
  "CONFIRMED",
  "CANCELLED",
  "REJECTED",
]);

export const PaymentStatusEnum = z.enum([
  "UNPAID",
  "PARTIALLY_PAID",
  "DEPOSIT_PAID",
  "BALANCE_DUE",
  "FULLY_PAID",
  "FAILED",
  "REFUNDED",
  "PARTIALLY_REFUNDED",
]);

const TravelerTypeEnum = z.enum([
  "COUPLE",
  "SOLO",
  "FAMILY",
  "FRIENDS",
  "GROUP",
]);

// ---------- list / filter ----------
export const getBookingValidator = z.object({
  query: z
    .object({
      page: z.coerce.number().int().positive().optional(),
      limit: z.coerce.number().int().positive().max(100).optional(),
      id: z.string().trim().optional(),
      journeyId: z.string().trim().optional(),
      bookingStatus: BookingStatusEnum.optional(),
      paymentStatus: PaymentStatusEnum.optional(),
      bookingNumber: z.string().trim().optional(),
      travelerEmail: z.string().trim().optional(),
      travelerName: z.string().trim().optional(),
      travelerType: TravelerTypeEnum.optional(),
      search: z.string().trim().min(1).optional(),
      departureFrom: z.coerce.date().optional(),
      departureTo: z.coerce.date().optional(),
      dueBefore: z.coerce.date().optional(), // bookings with a next-due schedule item before this date
    })
    .superRefine((query, ctx) => {
      if (
        query.departureFrom &&
        query.departureTo &&
        query.departureFrom > query.departureTo
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["departureTo"],
          message: "departureTo must be on or after departureFrom",
        });
      }
    }),
});

// ---------- public / customer: create a travel request (no payment taken, spec §11) ----------
export const createBookingRequestValidator = z.object({
  body: z
    .object({
      journeyId: z.string().trim().min(1),
      travelerFirstName: z.string().trim().min(1),
      travelerLastName: z.string().trim().min(1),
      travelerEmail: z.string().trim().email(),
      travelerPhone: z.string().trim().optional(),
      travelerNationality: z.string().trim().optional(),
      travelerBirthDate: z.coerce.date().optional(),
      travelArrivalDate: z.coerce.date(),
      travelDepartureDate: z.coerce.date(),
      addOnIds: z.array(z.string().trim()).optional(),
      travelerMessage: z.string().trim().optional(),
      travelerType: TravelerTypeEnum.optional(),
      adults: z.coerce.number().int().min(0).default(1),
      children: z.coerce.number().int().min(0).optional(),
      childrenAges: z.array(z.coerce.number().int().min(0)).optional(),
      currency: z.string().trim().length(3).optional(),
      agreedToTerms: z.coerce.boolean(),
      agreedToPrivacyPolicy: z.coerce.boolean(),
      acknowledgedRequestOnly: z.coerce.boolean(),
    })
    .superRefine((data, ctx) => {
      if (data.travelDepartureDate < data.travelArrivalDate) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["travelDepartureDate"],
          message: "travelDepartureDate must be on or after travelArrivalDate",
        });
      }
      if (!data.agreedToTerms)
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["agreedToTerms"],
          message: "Terms must be accepted",
        });
      if (!data.agreedToPrivacyPolicy)
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["agreedToPrivacyPolicy"],
          message: "Privacy policy must be accepted",
        });
      if (!data.acknowledgedRequestOnly)
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["acknowledgedRequestOnly"],
          message:
            "Customer must acknowledge this is a request only — no payment is taken now (spec §11)",
        });
    }),
});

// ---------- admin: edit traveler / logistics details before approval ----------
export const updateBookingValidator = z.object({
  params: z.object({ id: z.string().trim().min(1) }),
  body: z.object({
    travelerFirstName: z.string().trim().min(1).optional(),
    travelerLastName: z.string().trim().min(1).optional(),
    travelerEmail: z.string().trim().email().optional(),
    travelerPhone: z.string().trim().optional(),
    travelerNationality: z.string().trim().optional(),
    travelerBirthDate: z.coerce.date().optional(),
    travelArrivalDate: z.coerce.date().optional(),
    travelDepartureDate: z.coerce.date().optional(),
    addOnIds: z.array(z.string().trim()).optional(),
    travelerMessage: z.string().trim().optional(),
    travelerType: TravelerTypeEnum.optional(),
    adults: z.coerce.number().int().min(0).optional(),
    children: z.coerce.number().int().min(0).optional(),
    childrenAges: z.array(z.coerce.number().int().min(0)).optional(),
    bookingStatus: z.enum(["UNDER_REVIEW"]).optional(), // the only manual transition allowed here; APPROVED/REJECTED/CANCELLED go through their own actions
  }),
});

// ---------- admin: approve booking + (auto or manual) generate payment schedule ----------
const manualScheduleItemValidator = z.object({
  label: z.string().trim().min(1),
  calculationType: z.enum(["PERCENTAGE", "FIXED", "REMAINDER"]),
  ruleValue: z.coerce.number().nonnegative().optional(), // % or fixed currency amount; omit for REMAINDER
  dueRule: z.enum([
    "IMMEDIATE_AFTER_APPROVAL",
    "DAYS_BEFORE_DEPARTURE",
    "FIXED_DATE",
    "MANUAL",
  ]),
  dueValue: z.coerce.number().int().nonnegative().optional(), // days-before-departure value
  fixedDate: z.coerce.date().optional(),
});

export const approveBookingValidator = z.object({
  params: z.object({ id: z.string().trim().min(1) }),
  body: z
    .object({
      confirmedTotal: z.coerce.number().positive().optional(), // if omitted, auto-estimated from journey price + add-ons
      currency: z.string().trim().length(3).optional(),
      scheduleOverride: z
        .object({
          overrideReason: z.string().trim().min(1),
          items: z.array(manualScheduleItemValidator).min(1),
        })
        .optional(),
    })
    .optional()
    .default({}),
});

export const rejectBookingValidator = z.object({
  params: z.object({ id: z.string().trim().min(1) }),
  body: z.object({ reason: z.string().trim().min(1) }),
});

export const cancelBookingValidator = z.object({
  params: z.object({ id: z.string().trim().min(1) }),
  body: z.object({ reason: z.string().trim().min(1) }),
});

export const reviseTotalValidator = z.object({
  params: z.object({ id: z.string().trim().min(1) }),
  body: z.object({
    newConfirmedTotal: z.coerce.number().positive(),
    reason: z.string().trim().min(1),
  }),
});

export const deleteBookingValidator = z.object({
  body: z.object({ id: z.union([z.string(), z.array(z.string())]) }),
});
