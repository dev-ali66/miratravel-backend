# POLI Server — developer and AI-agent onboarding

This folder is the current-code guide for the POLI/Mira Travel backend. Read the files in this order when starting a feature, reviewing a change, or prompting another AI agent.

1. [Architecture and runtime](./01-architecture-runtime.md) — startup, request lifecycle, configuration, middleware, and folder responsibilities.
2. [API reference](./02-api-reference.md) — all mounted API groups, CRUD convention, authentication, uploads, and request examples.
3. [Domain logic](./03-domain-logic.md) — location hierarchy, CMS/page ownership, Journey composition, and booking behavior.
4. [Search and query contracts](./04-search-query-contracts.md) — frontend filters, universal booking search, pagination, and response shape.
5. [AI/developer implementation notes](./05-ai-developer-notes.md) — safe change procedure, reusable services, known constraints, and verification checklist.

## Quick facts

- Runtime: Node.js, TypeScript, Express 5, Prisma/PostgreSQL, Redis, Cloudinary, Zod, Socket.IO.
- Base API URL: `/api/v1`.
- Router registration source of truth: `bootstraps.ts`.
- Prisma schema source of truth: `prisma/schema/*.prisma`.
- CRUD convention: `GET /`, `POST /` create, `POST /` with `id` update, `DELETE /` with `{ "id": "..." }` delete. **Exception:** `/bookings`, `/payment-schedules`, `/payment-records`, and `/payment-config` use explicit action routes instead — see `02-api-reference.md#booking--payment-endpoints`.
- Complete importable request collection: `postman/mira-bootstrap-complete.postman_collection.json`.
- Sample request data: `postman/mira-crud-sample-data.json`.

## Important terminology

- **Location** is a hierarchy: a record can have a `parentId` and many `children`.
- **JourneyLocation** defines the geographic roots selected for a Journey.
- **Itinerary location** and **JourneyAddOn location** must be descendants of a JourneyLocation root; unrelated locations are rejected.
- **CMS page** is a generic page; Country/Region/Place pages are typed destination pages backed by a Location.

## Commands

```bash
npm run build
npx prisma validate
npx prisma migrate deploy
npm test
```

Do not run `npm test` against a database containing real data: the configured test command clears and seeds the test database.
