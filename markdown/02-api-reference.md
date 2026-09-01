# API reference

Base URL: `/api/v1`. A protected request uses `Authorization: Bearer <accessToken>`.

## Common conventions

| Operation | Method | Body |
| --- | --- | --- |
| List/read | `GET /resource` | query parameters |
| Create | `POST /resource` | resource fields |
| Update | `POST /resource` | same fields plus `id` |
| Delete | `DELETE /resource` | `{ "id": "recordId" }` |

The API uses `POST` for update, not `PATCH`/`PUT`. Generic list responses contain `code`, `success`, `message`, `meta` (`total`, `page`, `limit`, `totalPages`), and `data`.

## Mounted route groups

| Prefix | Read access | Write access | Purpose |
| --- | --- | --- | --- |
| `/auth` | mixed | mixed | account lifecycle and session APIs |
| `/roles` | protected | protected | role CRUD |
| `/permissions` | protected | protected | permission CRUD |
| `/file-upload` | protected | protected | generic multi-file upload to Cloudinary (returns URLs to embed in other resources) |
| `/cms-pages` | public GET | protected | generic CMS pages |
| `/cms-pages-sections` | public GET | protected | generic CMS sections |
| `/locations` | public GET | protected | hierarchical geography |
| `/country-pages` | public GET | protected | page attached to a COUNTRY location |
| `/country-pages-sections` | public GET | protected | country-page content sections |
| `/region-pages` | public GET | protected | page attached to a REGION location |
| `/region-pages-sections` | public GET | protected | region-page content sections |
| `/place-pages` | public GET | protected | page attached to a PLACE location |
| `/place-pages-sections` | public GET | protected | place-page content sections |
| `/journeys` | public GET | protected | Journey CRUD/discovery |
| `/journey-locations` | public GET | protected | Journey roots and optional selectable descendants |
| `/journey-itinerary` | public GET | protected | day-by-day Journey items |
| `/journey-accommodations` | public GET | protected | Journey stays |
| `/addons` | public GET | protected | reusable add-ons |
| `/journey-addons` | public GET | protected | add-on attached to a Journey and location |
| `/bookings` | protected GET | mixed — see below | traveler booking requests + admin workflow actions |
| `/payment-schedules` | protected | protected | generated/overridden payment schedules per booking |
| `/payment-records` | protected | protected (append-only; refunds instead of edits/deletes) | individual payment transactions |
| `/payment-config` | protected | protected | configurable deposit/full-payment rules (global or per-journey) |

## Auth endpoints

```text
POST /auth/register
POST /auth/register/instructorInfo/:token
POST /auth/register/userInfo/:token
POST /auth/verify-email
GET  /auth/verify-email/:token
POST /auth/resend-verification
POST /auth/login
POST /auth/refresh-token
POST /auth/logout
POST /auth/forgot-password
GET  /auth/verify-forgot-password
POST /auth/verify-forgot-password
GET  /auth/reset-password
POST /auth/reset-password
GET  /auth/me
GET  /auth/user-info
POST /auth/change-password
POST /auth/me
```

## Booking & payment endpoints

`/bookings` no longer follows the plain generic-CRUD shape used elsewhere — booking approval and payment
are rule-driven (see [`03-domain-logic.md`](./03-domain-logic.md#booking--payment-domain)), so the module
exposes explicit action routes instead of overloading a single `POST`.

```text
GET    /bookings                        — admin/manager list (traveler PII, protected)
POST   /bookings                        — customer submits a travel request (protected: must be logged in; no payment taken)
PATCH  /bookings/:id                    — admin edits traveler/logistics details (pre-approval only)
POST   /bookings/:id/approve            — admin approves; generates the payment schedule
POST   /bookings/:id/reject             — admin rejects (pre-approval only)
POST   /bookings/:id/cancel             — admin cancels
POST   /bookings/:id/revise-total       — admin revises the confirmed total after a partial payment
DELETE /bookings                        — admin deletes (blocked once any payment is recorded)

GET    /payment-schedules               — list/filter schedules
GET    /payment-schedules/due-overview  — items due/overdue, for an admin dashboard
POST   /payment-schedules/override      — replace the active schedule with custom items
POST   /payment-schedules/:itemId/waive — waive a single schedule item (recalculates the booking total)
POST   /payment-schedules/send-request  — mark the next (or a specific) item as requested; emails the traveler

GET    /payment-records                 — list/filter payment transactions
POST   /payment-records                 — record a manual or PSP payment (SUCCEEDED/FAILED/PENDING)
POST   /payment-records/:id/refund      — full or partial refund (records are never deleted)

GET    /payment-config                  — fetch rules for a scope ("global" or "journey:<id>")
POST   /payment-config                  — create/update rules for a scope
```

Why a customer must be logged in to create a booking: `Booking.createdBy` is a required foreign key to
`Auth` in the Prisma schema, so an anonymous "guest" booking cannot be persisted. `POST /bookings` is
therefore `protect`-only (any authenticated account may submit their own request) rather than public.

## File upload endpoint

```text
POST /file-upload
```

Standalone, resource-agnostic upload endpoint (`protect`-only, any authenticated account) used to push files to
Cloudinary and get back URLs — either ahead of a create/update call, or pointed at by the `fileRemove` mechanism
described below. It does not persist anything itself; it only uploads/deletes on Cloudinary and returns URLs
grouped by form field name.

Request is `multipart/form-data`, any field name(s), any number of files:

```text
Content-Type: multipart/form-data

image: <file>
gallery: <file>
gallery: <file>
fileRemove: ["https://res.cloudinary.com/.../old-image.jpg"]   // optional, JSON string
```

- Accepts up to 10 files per request, image types only (`jpeg`, `png`, `svg+xml`, `gif`, `webp`), 10MB each.
- If `fileRemove` is present, those Cloudinary URLs are deleted first (with retry) before new files upload.
- Response groups uploaded URLs by field name:

```json
{
  "code": 201,
  "success": true,
  "message": "Image Upload Successful",
  "data": {
    "image": ["https://res.cloudinary.com/.../image.jpg"],
    "gallery": ["https://res.cloudinary.com/.../g1.jpg", "https://res.cloudinary.com/.../g2.jpg"]
  }
}
```

## Upload behavior

Most writes may use `multipart/form-data` directly on the resource's own endpoint instead of going through
`/file-upload` first. Fields containing arrays/objects should be JSON strings in form data. Required media
fields are uploaded by their field name:

| Resource | Required file field(s) |
| --- | --- |
| Journey | `heroImage`, `gallery` |
| Journey itinerary | `image` |
| Journey accommodation | `image` |
| AddOn | `image` |

Use `fileRemove` to request old external URLs be removed during an update.