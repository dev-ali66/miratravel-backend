# AI and developer implementation notes

## Source-of-truth rules

1. Check `bootstraps.ts` before claiming an endpoint exists.
2. Check the module route and Zod validator before writing a client payload.
3. Check `prisma/schema/*.prisma` before adding a relational field or relying on a cascade.
4. Use a service layer for business rules; do not put database logic directly into controllers.
5. Use existing shared CRUD helpers unless the feature requires a genuinely different transaction/query pattern.

## Adding a CRUD module

1. Add/adjust the Prisma model and relation.
2. Create a migration; use `npx prisma migrate dev` locally or `npx prisma migrate deploy` for a prepared deployment.
3. Add `validator`, `service`, `controller`, and `routes` files.
4. Mount the router in `bootstraps.ts`.
5. Apply `protect`, `accessMiddleware(resourceName)`, upload middleware, and Zod validation to writes.
6. Add the route and payload to the Postman collection/sample data.
7. Update this Markdown folder when a new cross-module rule or query contract is introduced.

## Creating a relational rule

Use this pattern for a rule like “a child record must belong inside the parent's location scope”:

1. Resolve the effective create/update values. On update, use the old DB value for omitted relation fields.
2. Validate referenced rows exist.
3. Query relationships efficiently; use a recursive SQL CTE for arbitrary-depth hierarchy.
4. Throw `ApiError` with a meaningful 4xx response before calling `manageRecordWithFiles`.
5. Keep database foreign keys as the final integrity layer.

The Journey descendant-location rule is implemented in `src/modules/journey/journeyLocationScope.service.ts` and reused by itinerary and JourneyAddOn services.

## Cache and audit behavior

Read operations may cache for 60 seconds when Redis is ready. Writes invalidate tagged cache entries. Shared services also invoke audit logging. New read services should pass a stable `modelName`; new writes should preserve that naming so cache invalidation remains understandable.

## Security-sensitive areas

- Treat Booking data as PII: retain protected list/update/delete routes.
- Booking/payment endpoints are action-based, not the plain generic-CRUD `POST` shape used elsewhere — see `02-api-reference.md#booking--payment-endpoints`. Any change to schedule generation must go through `src/modules/booking/engine/paymentEngine.service.ts`; do not re-implement the 30/70 or 60-day rule inline in a controller/service.
- Payment amounts are Prisma `Decimal`; always wrap in `Number(...)` before arithmetic (see `round2()` / `recalculateBookingState()` in the payment engine) — comparing or adding raw `Decimal` values silently misbehaves.
- `PaymentRecord` rows are append-only (spec rule 82): never add an update/delete route for them; corrections go through `POST /payment-records/:id/refund`.
- Do not add protected admin APIs without permission resources/roles.
- Do not trust a client-provided relationship ID merely because it exists; validate ownership/scope/location rules.
- Do not log passwords, access tokens, refresh tokens, OTPs, or external service secrets.
- Never commit `.env`, generated secrets, or a Postman collection containing live credentials.

## Known implementation constraints to verify before major work

- Required media arrays use multipart uploads; raw JSON alone cannot create a Journey/AddOn/itinerary/accommodation with required image fields.
- Update convention is `POST` plus `id`; preserve it unless a planned API-version migration changes clients too.
- Access control depends on roles/permissions attached to the authenticated request. When changing authentication/token lifecycle, re-test all protected CRUD routes.
- The test script clears and seeds a database. Confirm it targets a disposable test database before running it.

## Verification checklist

```bash
npx prisma validate
npm run build
node -e "JSON.parse(require('fs').readFileSync('postman/mira-bootstrap-complete.postman_collection.json'))"
```

For a migration, also run `npx prisma migrate status` after deployment. For behavior changes, add focused tests that cover both allowed and rejected cases (for example, Gulshan child accepted and Uttara rejected).
