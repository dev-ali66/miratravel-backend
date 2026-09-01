# Domain and business logic

## Location hierarchy

`Location` is the canonical geography table. It stores `name`, unique `slug`, enum `type`, optional `parentId`, and `geoData`, `metadata`, and `data` JSON. The hierarchy can represent continent through landmark:

```text
CONTINENT -> SUBCONTINENT -> REGION -> COUNTRY -> ADMINISTRATIVE_AREA
-> CITY / TOWN / VILLAGE -> DESTINATION / PLACE / LANDMARK
```

The exact tree is content-defined; the schema does not force a particular depth. Frontend tree views should use `GET /locations` and each record's parent/children relation.

## CMS and destination pages

### Generic CMS

`CmsPage` has `name`, unique `slug`, `metadata`, `data`, and many `CmsPageSection` records. A section belongs to one page and has `name`, `slug`, `type`, `order`, `metadata`, and `data`. The unique key is `[pageId, slug]`; deleting a page cascades to sections.

### Country / region / place pages

These models are intentionally separate from generic CMS pages:

```text
Location (type COUNTRY) -> CountryPage -> CountryPageSection[]
Location (type REGION)  -> RegionPage  -> RegionPageSection[]
Location (type PLACE)   -> PlacePage   -> PlacePageSection[]
```

Each page has a unique `locationId`, so one Location can own only one page of the corresponding type. Services validate the Location type before create/update. Page listing includes Location plus sections ordered ascending by `order`.

Use `metadata` for machine/SEO/brand configuration and `data` for flexible page content. Mira-oriented examples include country stamp, accent colour, editorial tint, hero data, `Mira Note`, `Mira Recommends`, and `Mira Difference`; these are JSON contracts owned by the frontend/content team rather than hard Prisma columns.

## Journey aggregate

`Journey` is the primary sellable travel product. It contains headline fields, price/currency, duration, image arrays, listing arrays, discovery enum arrays, status, and free-form `metadata`/`data`.

```text
Journey
  ├─ JourneyLocation[]       geographic roots
  ├─ JourneyItinerary[]      days, ordered by dayNumber
  ├─ JourneyAccommodation[]  stays, ordered by order
  ├─ JourneyAddOn[]          optional extras by location
  └─ Booking[]
```

The Journey GET service returns this aggregate with related Locations, itinerary, accommodation, and AddOn data included.

### Journey geographic rule

1. Add one or more geographic roots using `POST /journey-locations`.
2. When an itinerary record has `locationId`, it must be a **direct or nested child** of a selected JourneyLocation root.
3. When a JourneyAddOn is created, `locationId` is required and obeys the same descendant rule.
4. The root itself is not accepted as an itinerary/add-on location. A root exists to scope its finer-grained children.
5. The check uses a recursive PostgreSQL CTE, so it works for any hierarchy depth.

Example: Journey root = Gulshan. Gulshan-1 and Gulshan-2 are accepted. Uttara is rejected with HTTP 400, even if Uttara exists in Location.

For the admin Journey AddOn or itinerary location selector, reuse:

```text
GET /api/v1/journey-locations?journeyId=<journeyId>&includeChildren=true
```

The response keeps the configured roots in `data` and adds a flat `availableLocations` array containing all direct/nested descendants. The frontend submits a selected descendant ID as `locationId`.

`JourneyAddOn` now stores `journeyId`, `addOnId`, and nullable DB-level `locationId` (required by the API for new records). Existing historical rows may have a null location after the migration; new API writes must include one.

## Booking & payment domain

Full spec: *Mira Travel — Booking & Payment Rules v1.0* (30 Aug 2026). Mira is **request-first,
human-review-second** — a booking is never instantly confirmed or charged. The flow is:

```text
Request → Review → Approval (schedule generated) → Payment request(s) → Confirmed
```

### Booking status vs payment status

They are stored and evolve **separately** (a booking can be `APPROVED` while `UNPAID`, or
`DEPOSIT_PAID_TENTATIVE` while the balance is still due):

| `BookingStatus` | Meaning |
| --- | --- |
| `REQUEST_SUBMITTED` | Customer submitted a request. No payment taken. |
| `UNDER_REVIEW` | Admin is checking availability/pricing. |
| `APPROVED` | Final offer approved; payment schedule generated but not yet requested. |
| `AWAITING_DEPOSIT` | First payment request sent (deposit or full payment). |
| `DEPOSIT_PAID_TENTATIVE` | Deposit (or partial) received; balance remains. |
| `AWAITING_FINAL_PAYMENT` | A later installment/final balance is open. |
| `FULLY_PAID` / `CONFIRMED` | All required payments received. |
| `CANCELLED` / `REJECTED` | Terminal states. |

| `PaymentStatus` | Meaning |
| --- | --- |
| `UNPAID`, `PARTIALLY_PAID`, `DEPOSIT_PAID`, `BALANCE_DUE`, `FULLY_PAID`, `FAILED`, `REFUNDED`, `PARTIALLY_REFUNDED` | see `paymentEngine.service.ts::recalculateBookingState` |

### Payment schedule rule (spec §5)

Resolved at **approval time** by `resolvePaymentSchedule()` in
`src/modules/booking/engine/paymentEngine.service.ts`, using the effective `PaymentConfig`
(journey-level override, else global — never hardcoded):

- **> `fullPaymentRequiredIfWithinDays` days before departure** (default 60): deposit now
  (`depositType` = `PERCENTAGE`, default 30%, or `FIXED`) + remainder due
  `finalPaymentDueDaysBeforeDeparture` days before departure (default 60).
- **≤ that many days before departure**: one item, 100% due immediately. No deposit shown.
- **Fixed deposit ≥ confirmed total**: falls back to full payment instead of a zero/negative
  remainder (spec §13 rule 78).
- Rounding differences are absorbed by a `REMAINDER` item so the schedule always sums exactly to
  the confirmed total (spec §7).

Admins can bypass auto-resolution entirely with `scheduleOverride` on approve, or later via
`POST /payment-schedules/override`, to build multi-installment plans (B2B, groups, promotions)
without any schema change — every item is still just a row in `PaymentScheduleItem`.

### Money flow

```text
Booking
  ├─ confirmedTotal, currency        (frozen snapshot at approval — spec §9)
  ├─ paidAmount, outstandingAmount   (recomputed after every payment/refund/waiver)
  ├─ PaymentSchedule (ACTIVE one selected via selectedPaymentScheduleId; others SUPERSEDED/CANCELLED)
  │    └─ PaymentScheduleItem[]      (sequence, label, calculationType, dueRule/dueDate, status)
  └─ PaymentRecord[]                 (append-only transactions; refund via refundAmount, never delete)
```

`recalculateBookingState()` is the single source of truth for `paidAmount`, `outstandingAmount`,
`paymentStatus`, and forward-only `bookingStatus` transitions — it runs after every payment, refund,
schedule override, waiver, and total revision, so the two status fields never drift out of sync.

### Admin actions and their guardrails

| Action | Route | Guardrail |
| --- | --- | --- |
| Approve | `POST /bookings/:id/approve` | only from `REQUEST_SUBMITTED`/`UNDER_REVIEW` |
| Reject | `POST /bookings/:id/reject` | only pre-approval |
| Cancel | `POST /bookings/:id/cancel` | not already `CANCELLED`/`REJECTED`; supersedes the active schedule |
| Revise total | `POST /bookings/:id/revise-total` | new total ≥ amount already paid; redistributes unpaid items only (spec §13 rule 79) |
| Override schedule | `POST /payment-schedules/override` | requires `PaymentConfig.allowAdminOverride` |
| Waive item | `POST /payment-schedules/:itemId/waive` | not already `PAID`; reduces `confirmedTotal` by the outstanding portion |
| Record payment | `POST /payment-records` | `SUCCEEDED` updates item + booking totals; `FAILED` keeps the amount due for retry (spec Table 10) |
| Refund | `POST /payment-records/:id/refund` | amount ≤ refundable remainder; original record is never deleted (spec §13 rule 82) |
| Delete booking | `DELETE /bookings` | blocked once `paymentStatus` is anything but `UNPAID` |
