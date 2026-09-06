# Search and query contracts

## Pagination

List endpoints use:

```text
page=1&limit=10
```

`page` is one-based. Frontends should render pagination from `meta.total`, `meta.page`, `meta.limit`, and `meta.totalPages`.

## Journey discovery query

`GET /journeys` supports:

| Query                        | Meaning                                 |
| ---------------------------- | --------------------------------------- |
| `id`, `slug`                 | exact record lookup                     |
| `status`                     | `DRAFT`, `PUBLISHED`, `ARCHIVED`        |
| `featured`                   | `true` or `false`                       |
| `journeyType`                | one/many JourneyType values             |
| `travelStyle`                | one/many TravelStyle values             |
| `perfectFor`                 | one/many PerfectFor values              |
| `pace`                       | `RELAXED`, `BALANCED`, `ACTIVE`         |
| `comfortLevel`               | `COMFORT`, `BOUTIQUE`, `PREMIUM_LUXURY` |
| `minPrice`, `maxPrice`       | inclusive price range                   |
| `minDays`, `maxDays`         | Journey duration overlap range          |
| `locationId`, `locationSlug` | Journey root location                   |
| `search`                     | title, subtitle, and slug text search   |

Use either comma-separated or repeated multi-select keys:

```text
/journeys?journeyType=PRIVATE_JOURNEY,SMALL_GROUP
/journeys?travelStyle=NATURE&travelStyle=CULTURE_HERITAGE
```

Multiple Journey search words use AND between words; each word can match title, subtitle, or slug.

## Location and destination-page search

- `GET /locations?name=...&slug=...&type=...&search=...`
- Country/Region/Place page lists support `id`, `locationId`, `name`, `slug`, and `search`.
- Page-section lists support `id`, `pageId`, `name`, `slug`, and `search`.

`search` tokenizes input and uses case-insensitive matching. Location searches also recognize a LocationType token.

## Booking universal search (admin only)

`GET /bookings` accepts:

```text
page, limit, id, journeyId, bookingStatus, paymentStatus, bookingNumber,
travelerEmail, travelerName, travelerType,
departureFrom, departureTo, dueBefore, search
```

`travelerName` matches `travelerFirstName` OR `travelerLastName` (case-insensitive). `departureFrom`/
`departureTo` filter on `travelDepartureDate` and must be ordered correctly. `dueBefore` returns bookings
whose active schedule has an unpaid item (`SCHEDULED`/`DUE`/`PENDING`) due on or before that date — this
powers an admin "upcoming/overdue payments" view.

`search` is the booking universal search. Each space-separated word must match at least one of:

```text
bookingNumber, travelerFirstName, travelerLastName, travelerEmail, travelerPhone,
journey.title, journey.slug
```

Example:

```text
/bookings?bookingStatus=AWAITING_FINAL_PAYMENT&search=rahim+017&page=1&limit=20
```

This endpoint is intentionally protected; do not expose the unfiltered booking list to public frontend users.

## Payment schedule / record queries (admin only)

```text
GET /payment-schedules?bookingId=...&status=ACTIVE|SUPERSEDED|CANCELLED
GET /payment-schedules/due-overview?dueBefore=<date>          -- overdue as of that date (default: now)
GET /payment-schedules/due-overview?withinDays=7              -- due within the next N days
GET /payment-records?bookingId=...&scheduleItemId=...&status=SUCCEEDED|FAILED|PENDING|REFUNDED|PARTIALLY_REFUNDED
```
