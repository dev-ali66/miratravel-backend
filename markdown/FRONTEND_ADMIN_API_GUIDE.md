# Frontend and Admin API guide

Base URL: `http://localhost:5010/api/v1`

Public read endpoints: `GET /locations`, `GET /cms-pages`, `GET /cms-pages-sections`, `GET /country-pages`, `GET /country-pages-sections`, `GET /region-pages`, `GET /region-pages-sections`, `GET /place-pages`, `GET /place-pages-sections`, `GET /journeys`. `POST /bookings` requires a logged-in traveler (see below) — it is not a public endpoint.

Admin CRUD endpoints use `GET /`, `POST /` (create or update when `id` is supplied), and `DELETE /` (`{ "id": "..." }`). Send `Authorization: Bearer <accessToken>` for protected operations.

## Journey listing and discovery

`GET /journeys` supports pagination plus these filters:

```text
page, limit, id, slug, status, featured,
journeyType, travelStyle, perfectFor, pace, comfortLevel,
minPrice, maxPrice, minDays, maxDays, locationId, locationSlug, search
```

Multi-select filters accept comma-separated values or repeated query keys.

```text
GET /journeys?journeyType=PRIVATE_JOURNEY,SMALL_GROUP&travelStyle=NATURE,CULTURE_HERITAGE&perfectFor=COUPLES&pace=BALANCED&comfortLevel=BOUTIQUE
```

## Booking request submission (authenticated traveler)

`POST /bookings` requires `Authorization: Bearer <accessToken>` — `Booking.createdBy` is a required
foreign key to `Auth`, so there is no anonymous/guest booking. No payment is taken at this step; the
customer only acknowledges terms, privacy policy, and that this is a **request**, not a confirmed/paid
booking.

```json
POST /bookings
{
  "journeyId": "...",
  "travelerFirstName": "Sample",
  "travelerLastName": "Traveller",
  "travelerEmail": "traveller@example.com",
  "travelArrivalDate": "2026-12-01T00:00:00.000Z",
  "travelDepartureDate": "2026-12-10T00:00:00.000Z",
  "addOnIds": [],
  "adults": 2,
  "agreedToTerms": true,
  "agreedToPrivacyPolicy": true,
  "acknowledgedRequestOnly": true
}
```

## Admin booking search

`GET /bookings` is protected because it exposes traveler PII. It supports:

```text
page, limit, id, journeyId, bookingStatus, paymentStatus, bookingNumber,
travelerEmail, travelerName, travelerType,
departureFrom, departureTo, dueBefore, search
```

`search` is a universal booking search: each word is matched against booking number, traveler first/last
name, email, phone, journey title, and journey slug. `dueBefore` returns bookings with an unpaid schedule
item due on or before that date (an overdue/upcoming-payments view).

```text
GET /bookings?bookingStatus=AWAITING_FINAL_PAYMENT&search=rahim+017&page=1&limit=20
```

## Booking admin workflow actions

```text
PATCH  /bookings/:id                    — edit traveler/logistics details (pre-approval only)
POST   /bookings/:id/approve            — approve; auto-generates (or accepts an override for) the payment schedule
POST   /bookings/:id/reject             — { "reason": "..." }
POST   /bookings/:id/cancel             — { "reason": "..." }
POST   /bookings/:id/revise-total       — { "newConfirmedTotal": 2200, "reason": "..." }
```

## Payment schedule, payment records, and payment config

```text
GET  /payment-schedules?bookingId=...
GET  /payment-schedules/due-overview?withinDays=7
POST /payment-schedules/override        — { bookingId, overrideReason, items: [...] }
POST /payment-schedules/:itemId/waive   — { "reason": "..." }
POST /payment-schedules/send-request    — { "bookingId": "..." } (optionally "scheduleItemId")

GET  /payment-records?bookingId=...
POST /payment-records                   — record a manual/PSP payment: { bookingId, amount, method, status, ... }
POST /payment-records/:id/refund        — { "refundAmount": 200, "adminNotes": "..." }

GET  /payment-config?scope=global               (or scope=journey:<journeyId>)
POST /payment-config                            — { scope, depositEnabled, depositType, depositValue, ... }
```

Full domain rules (deposit %/fixed, the 60-day full-payment window, rounding, revise-total, refunds,
audit trail) are documented in `03-domain-logic.md#booking--payment-domain`.

## Journey location rule

Add a root location through `POST /journey-locations`. For itinerary and journey add-on records, `locationId` must be a direct or nested child of one of that journey's root locations. Unrelated locations are rejected with HTTP 400.

For the admin Journey AddOn/itinerary location dropdown, reuse the same endpoint:

```http
GET /api/v1/journey-locations?journeyId={{journeyId}}&includeChildren=true
```

`data` contains configured roots and `availableLocations` contains every direct/nested descendant that can be used as `locationId`.


# Frontend/admin Journey location selector

No new endpoint is required for the Journey AddOn or itinerary location dropdown. Reuse the existing JourneyLocation endpoint:

```http
GET /api/v1/journey-locations?journeyId={{journeyId}}&includeChildren=true
```

The normal `data` property contains the Journey's configured root locations. The response additionally contains `availableLocations`, a flat list of every direct/nested descendant of those roots. The root itself is excluded because it defines the scope; its descendants are the selectable values for itinerary, accommodation, and JourneyAddOn `locationId`.

Example response shape:

```json
{
  "success": true,
  "data": [{ "id": "root-1", "location": { "name": "Gulshan" } }],
  "availableLocations": [
    { "id": "place-1", "name": "Gulshan 1", "slug": "gulshan-1", "type": "PLACE", "parentId": "root-1" }
  ]
}
```

Use the selected item's `id` as `locationId` when creating an itinerary or JourneyAddOn. An unrelated location such as Uttara is rejected by the server with HTTP 400 even if a client manually submits it.
