# Architecture and runtime

## Startup flow

`index.ts` is the process entry point.

1. Connect Prisma and run `SELECT 1`.
2. Start Redis when configured; Redis is optional.
3. Start `httpServer` from `app.ts`.
4. On `SIGINT`, `SIGTERM`, `SIGHUP`, unhandled rejection, or uncaught exception, close HTTP/Socket.IO, Prisma, and Redis with a 15-second shutdown timeout.

`app.ts` creates the Express app and HTTP/Socket.IO server. It mounts, in order:

```text
request profiler
static public files
helmet / hpp / xss / cors / compression
JSON + URL encoded parsers + cookies + global rate limiter
health and welcome routes
request/response logging
bootstraps(app)
Swagger
not-found + global error handler
```

Socket.IO accepts an access JWT from `handshake.auth.token` or the `Authorization` header. A socket can join a ticket room with `joinTicket`.

## Layering

```text
route -> middleware -> controller -> service -> shared service -> Prisma -> response
```

| Layer              | Responsibility                                                |
| ------------------ | ------------------------------------------------------------- |
| `*.routes.ts`      | HTTP method/path and middleware order                         |
| `*.validator.ts`   | Zod request shape and business-required fields                |
| `*.controller.ts`  | Calls a service and emits the standardized response           |
| `*.service.ts`     | Resource-specific query, relation, and business rules         |
| `src/shared/`      | Generic read/manage/delete, uploads, cache, email             |
| `src/middlewares/` | authentication, permission checks, validation, upload, errors |
| `prisma/schema/`   | PostgreSQL models, relations, enum values, migrations         |

## Shared services

### `getRecords`

Provides pagination, generic filtering, include/select support, Redis caching, permission scope filtering, and audit logging. Callers can supply `customWhere` for Prisma-specific conditions and `excludeFilterKeys` for query parameters that are already translated into `customWhere`.

### `manageRecordWithFiles`

One service handles create/update. It decides update mode from `body.id`, parses JSON-like form fields, uploads incoming files to Cloudinary, removes requested old files, writes Prisma data, rolls back newly uploaded files if the DB write fails, invalidates cache, and writes audit data.

### `deleteRecordsSafely`

Accepts one or more IDs, applies permission scope, finds records, deletes external Cloudinary URLs when configured, deletes rows in a transaction, invalidates cache, and logs the deletion.

## Auth and authorization

- `protect` reads access tokens from the `accessToken` cookie or `Authorization: Bearer <token>`.
- `accessMiddleware("Resource")` derives `CREATE`, `READ`, `UPDATE`, or `DELETE` from HTTP method and presence of `id`, then matches the JWT role permissions.
- Roles own Permissions; Permission has `action`, `resource`, and `scope` (`OWN`, `ANY`, `OTHER`).
- Public reads bypass that middleware. Booking creation requires `protect` (an authenticated traveler account — `Booking.createdBy` is a required FK to `Auth`) but skips `accessMiddleware`, since any account holder may submit their own request. Admin/dashboard writes, including all booking workflow actions and payment routes, require both `protect` and `accessMiddleware`.

## Configuration

`src/config/index.ts` loads dotenv-flow outside production. Important settings:

```text
DATABASE_URL
PORT, NODE_ENV
CORS_ALLOWED_ORIGINS, SOCKET_ALLOWED_ORIGINS
JWT_ACCESS_TOKEN_SECRET, JWT_REFRESH_TOKEN_SECRET
CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET
REDIS_HOST, REDIS_PORT, REDIS_TIMEOUT
EMAIL_USER, EMAIL_PASS, EMAIL_FROM
```

Never commit `.env`. The production container starts `dist/index.js`; the development Docker compose setup compiles/watches and runs the server.
