# POLI Server – Complete Backend Documentation

এই README টা পুরো projecto er backend architecture, routing flow, database design, controller-service pattern, middleware, utility layer, validation, file upload, Swagger, Redis, auth flow sobkisu cover kore. Ei file ta পড়ে কোন developer সহজেই এই backend কে understand, extend, debug, বা নতুন feature add করতে পারবে.

---

## 1. Project Overview

POLI Server হল একটি TypeScript + Express + Prisma based backend API. এটি REST API, JWT authentication, role-based access, file upload, Redis caching, Swagger documentation, Socket.IO, এবং CMS-style content management support করে.

### Main responsibilities

- Authentication and account management
- Role and permission based access control
- CMS content management for pages, destinations, journeys, sections, headings, pricing, includes, itinerary
- Wishlist management
- File upload to Cloudinary
- Swagger/OpenAPI docs generation
- Redis-backed caching for read-heavy operations
- Health monitoring and request/response logging

### Core tech stack

- Node.js
- TypeScript
- Express 5
- Prisma ORM
- PostgreSQL
- Redis
- Cloudinary
- Zod
- Swagger UI
- Socket.IO
- JWT
- Multer
- dotenv-flow

---

## 2. Project Structure

```text
app.ts
bootstraps.ts
index.ts
package.json
tsconfig.json
prisma/
  schema/
    auth.prisma
    destination.prisma
    journeys.prisma
    pages.prisma
    permission.prisma
    reservation.prisma
    role.prisma
    schema.prisma
    session.prisma
    user.prisma
    wishlist.prisma
src/
  config/
  database/
  docs/
  experimental/
  logger/
  middlewares/
  modules/
    admin/
    auth/
    booking/
    cms/
      destination/
      journeys/
      journeysHeading/
      journeysIncludes/
      journeysItinerary/
      journeysOverview/
      journeysPricing/
      pages/
      pagesSection/
    payments/
    reviews/
    users/
    wishList/
  shared/
  types/
  utils/
public/
tests/
```

---

## 3. Runtime Entry Points

### app.ts

এই file-এ main Express app define করা হয়েছে। এখানে আছে:

- Express app initialization
- CORS, Helmet, HPP, XSS protection
- Compression
- Cookie parser
- Global rate limiter
- JSON body parser
- Socket.IO server setup
- Health endpoint
- Swagger setup
- Error middleware registration
- Bootstrap mounting

### index.ts

Entry point for server start. সাধারণত app listen করে এবং server start করে।

### bootstraps.ts

এখানে সব module router mount করা হয়. API base path গুলো নীচে দেওয়া আছে:

```ts
mount(app, "/api/v1/auth", authRoutes);
mount(app, "/api/v1/pages", pagesRoutes);
mount(app, "/api/v1/pages-section", pagesSectionRoutes);
mount(app, "/api/v1/destination", destinationRoutes);
mount(app, "/api/v1/journeys", journeysRoutes);
mount(app, "/api/v1/journeys-overview", journeysOverviewRoutes);
mount(app, "/api/v1/journeys-itinerary", journeysItineraryRoutes);
mount(app, "/api/v1/journeys-includes", JourneysIncludesRoutes);
mount(app, "/api/v1/journeys-pricing", journeysPricingRoutes);
mount(app, "/api/v1/journeys-heading", journeysHeadingRoutes);
mount(app, "/api/v1/wishlist", wishlistRoutes);
```

---

## 4. Request Lifecycle

একটা request এটার flow সাধারণত নিচের মতো:

1. Request arrives at Express app
2. Global middlewares run
   - security middlewares
   - rate limiting
   - body parsing
   - cookie parsing
3. Route middleware chain runs
   - `protect` for auth
   - `accessMiddleware` for RBAC
   - `validate` for Zod validation
   - `uploadFile` for multer/form-data handling
4. Controller handles request
5. Controller calls service layer
6. Service layer uses shared utilities and Prisma
7. Response is sent via `successResponse`
8. Error middleware catches exceptions

### Typical module pattern

```text
route -> controller -> service -> shared util -> prisma -> response
```

---

## 5. Database Design (Prisma)

Database schema `prisma/schema/*.prisma` files-এ define করা আছে। Main datasource is PostgreSQL.

### Datasource

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

### Main models

#### Auth

```prisma
model Auth {
  id
  email
  password
  isVerified
  status
  otp
  otpExpiresAt
  passwordResetToken
  passwordResetExpiresAt
  emailToken
  failedLoginAttempts
  lockUntil
  isDeleted
  createdAt
  updatedAt
  sessions
  roles
  userPersonalInfo
  userSettings
  reservations
  wishlists
}
```

Purpose:
- primary user/account model
- authentication and profile relation owner
- used by login, registration, reset password, profile update, wishlist, reservation

#### Status enum

```prisma
enum Status {
  ACTIVE
  INACTIVE
  DEACTIVE
  BLOCKED
  SUSPENDED
  PENDING
  DELETED
  ARCHIVED
}
```

#### Role

```prisma
model Role {
  id
  name
  permissions
  users
}
```

Purpose:
- role-based access control
- roles like admin / contractor / driver etc. depending on implementation

#### Permission

```prisma
model Permission {
  id
  action
  resource
  scope
}
```

Action values:
- CREATE
- READ
- UPDATE
- DELETE

Scope values:
- OWN
- ANY
- OTHER

#### Session

```prisma
model Session {
  id
  authId
  refreshTokenHash
  tokenFamily
  deviceName
  userAgent
  ipAddress
  fingerprintHash
  isRevoked
  revokeReason
  expiresAt
  lastUsedAt
  createdAt
  updatedAt
}
```

Purpose:
- refresh token/session tracking
- supports multi-device logout and security flows

#### UserSettings

```prisma
model UserSettings {
  id
  authId
  createdAt
  updatedAt
}
```

#### UserPersonalInfo

```prisma
model UserPersonalInfo {
  id
  authId
  firstName
  lastName
  phone
  country
  state
  city
  zipCode
  about
  photoUrl
}
```

#### Pages

```prisma
model Pages {
  id
  name
  slug
  createdAt
  updatedAt
  pagesSections
}
```

#### PagesSection

```prisma
model PagesSection {
  id
  pageId
  order
  key
  title
  subTitle
  h1
  h2
  text
  small
  button
  buttonUrl
  pageSectionImages
  pageSectionVideos
  data
  isPublished
}
```

#### Destinations

```prisma
model Destinations {
  id
  name
  slug
  text
  url
  destinationImages
  destinationVideos
  createdAt
  updatedAt
  joruneys
}
```

#### Joruneys

```prisma
model Joruneys {
  id
  destinationId
  name
  slug
  text
  location
  url
  destinationImages
  destinationVideos
  isFeatured
  createdAt
  updatedAt
  journeysHeading
  journeysOverviews
  journeysItineraries
  journeysIncludes
  journeysPricing
  reservations
  wishlists
  destination
}
```

#### JourneysHeading

```prisma
model JourneysHeading {
  id
  journeyId
  order
  key
  title
  subTitle
  h1
  h2
  text
  features
  small
  button
  buttonUrl
  maxGuest
  journeysHeadingSectionImages
  journeysHeadingSectionVideos
  data
  isPublished
}
```

#### JourneysOverview

```prisma
model JourneysOverview {
  id
  journeyId
  order
  key
  title
  subTitle
  h1
  h2
  text
  features
  small
  button
  buttonUrl
  journeyOverviewSectionImages
  journeyOverviewpageSectionVideos
  data
  isPublished
}
```

#### JourneysItinerary

```prisma
model JourneysItinerary {
  id
  journeyId
  order
  key
  title
  subTitle
  h1
  h2
  text
  small
  button
  buttonUrl
  journeysItinerarySectionImages
  journeysItinerarySectionVideos
  data
  isPublished
}
```

#### JourneysIncludes

```prisma
model JourneysIncludes {
  id
  journeyId
  order
  key
  title
  subTitle
  h1
  h2
  text
  features
  small
  button
  buttonUrl
  journeysIncludesSectionImages
  journeysIncludesSectionVideos
  data
  isPublished
}
```

#### JourneysPricing

```prisma
model JourneysPricing {
  id
  journeyId
  order
  key
  price
  title
  subTitle
  h1
  h2
  text
  features
  small
  button
  buttonUrl
  journeysPricingSectionImages
  journeysPricingSectionVideos
  data
  isPublished
}
```

#### Wishlist

```prisma
model Wishlist {
  id
  authId
  journeyId
  createdAt
  updatedAt
}
```

#### Reservation

```prisma
model Reservation {
  id
  authId
  joruneyId
  firstName
  lastName
  email
  phone
  arrivalDate
  departureDate
  groupType
  groupInfo
  specialRequest
  createdAt
  updatedAt
}
```

---

## 6. Middleware Layer

### Security and request handling

#### app.ts middlewares

- `helmet` for security headers
- `hpp` for parameter pollution protection
- `xss` for XSS sanitization
- `cors` with configured origins
- `compression` for response compression
- `cookie-parser` for cookies
- `express.json` and `express.urlencoded` for body parsing
- `globalLimiter` for general API rate limiting

### Auth middlewares

#### protect

Used to authenticate user from access token in:
- cookies
- `Authorization: Bearer ...` header

It attaches `req.auth` to request.

#### authorize

Checks role-based access.

#### accessMiddleware

This is a reusable permission middleware. It determines the action based on `GET/POST/DELETE` and then checks the user’s permissions against the model/resource.

### Validation middleware

#### validate

Uses Zod schemas to parse and validate request data from:
- params
- query
- body

### File upload middleware

#### uploadFile

Handles multipart/form-data uploads with multer. It supports:
- image/video/audio/file upload
- size limits
- max file count
- metadata for Swagger

---

## 7. Module Structure Pattern

Every feature module follows this convention:

```text
src/modules/<module>/
  <module>.routes.ts
  <module>.controller.ts
  <module>.service.ts
  <module>.validator.ts
```

### Example: Auth module

```text
src/modules/auth/
  auth.routes.ts
  auth.controller.ts
  auth.service.ts
  auth.validator.ts
```

### Role of each file

- `*.routes.ts`: define Express routes and attach middleware chain
- `*.controller.ts`: receive request, call service, format response
- `*.service.ts`: business logic and Prisma operations
- `*.validator.ts`: Zod validation schemas

---

## 8. Core Modules

### 8.1 Auth Module

Path:
- `src/modules/auth/`

Routes:
- `POST /api/v1/auth/register`
- `POST /api/v1/auth/register/instructorInfo/:token`
- `POST /api/v1/auth/register/userInfo/:token`
- `POST /api/v1/auth/verify-email`
- `GET /api/v1/auth/verify-email/:token`
- `POST /api/v1/auth/resend-verification`
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/refresh-token`
- `POST /api/v1/auth/logout`
- `POST /api/v1/auth/forgot-password`
- `GET /api/v1/auth/verify-forgot-password`
- `POST /api/v1/auth/verify-forgot-password`
- `GET /api/v1/auth/reset-password`
- `POST /api/v1/auth/reset-password`
- `GET /api/v1/auth/me`
- `GET /api/v1/auth/user-info`
- `POST /api/v1/auth/change-password`
- `POST /api/v1/auth/me`

Responsibilities:
- user registration
- email verification
- resend otp / verification code
- login
- refresh token
- logout
- forgot password/reset password
- get current user info
- profile update

Main service functions:
- `createAccountService`
- `verifyEmail`
- `resendVerificationCode`
- `loginUserService`
- `refreshTokenService`
- `logoutAllDevicesService`
- `logoutSingleDeviceService`
- `forgotPasswordService`
- `verifyForgotPasswordService`
- `resetPasswordService`

### 8.2 CMS Pages Module

Path:
- `src/modules/cms/pages/`

Routes:
- `GET /api/v1/pages`
- `POST /api/v1/pages`

Responsibilities:
- manage page records
- fetch page data with sections

### 8.3 CMS Destination Module

Path:
- `src/modules/cms/destination/`

Routes:
- `GET /api/v1/destination`
- `POST /api/v1/destination`
- `DELETE /api/v1/destination`

Responsibilities:
- CRUD for destinations
- supports image/video fields

### 8.4 CMS Journeys Module

Path:
- `src/modules/cms/journeys/`

Routes:
- `GET /api/v1/journeys`
- `POST /api/v1/journeys`
- `DELETE /api/v1/journeys`

Responsibilities:
- CRUD for journeys
- supports media fields and feature flag

### 8.5 CMS Journey-Related Modules

Mounted under separate prefixes:

- `/api/v1/journeys-overview`
- `/api/v1/journeys-itinerary`
- `/api/v1/journeys-includes`
- `/api/v1/journeys-pricing`
- `/api/v1/journeys-heading`

These modules follow the same generic pattern as pages/destination/journeys. They manage section-specific journey content and publish flags.

### 8.6 Wishlist Module

Path:
- `src/modules/wishList/`

Routes:
- `GET /api/v1/wishlist`
- `POST /api/v1/wishlist`
- `DELETE /api/v1/wishlist`

Responsibilities:
- user-specific wishlist management
- tied to `authId` and `journeyId`

---

## 9. Shared Utility Layer

This project uses a rich shared layer so module code stays short and reusable.

### 9.1 getRecords service

File:
- `src/shared/getRecords.service.ts`

Purpose:
- generic read/query handler
- supports pagination
- supports search/filter through validated query/body/params
- supports RBAC scope filtering (`OWN`, `ANY`, `OTHER`)
- integrates with Redis cache
- logs audit records

Key behavior:
- page and limit from query
- cache key built from route + query + model + method
- uses `model.findMany()` and `model.count()`
- returns `meta.total`, `meta.page`, `meta.limit`, `meta.totalPages`

### 9.2 manageRecordWithFiles service

File:
- `src/shared/manageRecordWithFiles.service.ts`

Purpose:
- generic create/update handler with media support
- parses JSON-like strings and booleans from request input
- handles file removal by URL
- uploads new files to Cloudinary
- supports scope-based ownership rules
- invalidates Redis cache after change
- logs audit entries

### 9.3 delete.service

File:
- `src/shared/delete.service.ts`

Purpose:
- generic safe deletion with:
  - ID extraction from body/query/params
  - permission enforcement
  - external media deletion from Cloudinary
  - DB transaction-based delete
  - cache invalidation

### 9.4 upload_cloudinary.service

File:
- `src/shared/upload_cloudinary.service.ts`

Purpose:
- upload buffers to Cloudinary
- supports image/video/audio/raw resource types
- applies transformations for media optimization

### 9.5 delete_cloudinary.service

File:
- `src/shared/delete_cloudinary.service.ts`

Purpose:
- deletes uploaded media from Cloudinary

### 9.6 email_template.service

File:
- `src/shared/email_template.service.ts`

Purpose:
- HTML templates for email confirmation, password reset, password change, etc.

---

## 10. Utility Helpers

### auth.helper.ts

Purpose:
- password hashing
- JWT creation/verification
- OTP generation
- invite token generation
- password comparison

### email.helper.ts

Purpose:
- send emails via nodemailer

### api.error.ts

Purpose:
- custom API error class for consistent error responses

### success.response.ts

Purpose:
- standard success response formatting

### catch.async.ts

Purpose:
- wrap async controller/service functions for centralized error handling

### convertBooleans.ts

Purpose:
- convert string booleans like `"true"`/`"false"` to actual booleans

### extractDomains.ts

Purpose:
- extract host domains from external URLs

### extractExternalUrls.ts

Purpose:
- recursively extract URLs from objects/arrays

### extractIds.ts

Purpose:
- parse ID arrays from body/query/params

### retryOperation.ts

Purpose:
- retry failed operations safely

### perfomance.tester.ts

Purpose:
- request performance profiling middleware

---

## 11. Config Layer

File:
- `src/config/index.ts`

This loads environment variables and exposes shared config values.

### Important config values

- `PORT`
- `NODE_ENV`
- `DATABASE_URL`
- `CORS_ALLOWED_ORIGINS`
- `SOCKET_ALLOWED_ORIGINS`
- `JWT_ACCESS_TOKEN_SECRET`
- `JWT_REFRESH_TOKEN_SECRET`
- `JWT_INVITE_TOKEN_SECRET`
- `JWT_ACCESS_TOKEN_EXPIRES_IN`
- `JWT_REFRESH_TOKEN_EXPIRES_IN`
- `JWT_INVITE_TOKEN_EXPIRES_IN`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- `REDIS_HOST`
- `REDIS_PORT`
- `REDIS_TIMEOUT`
- `OTP_EXPIRE_MINUTE`
- `OTP_BASE_URL`
- `PASSWORD_RESET_EXPIRE_IN`
- `DIRECT_REGISTER`
- `TOKEN_REGISTER`
- `PASSWORD_LENGTH`

---

## 12. Environment Variables

Example:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/poli"

JWT_ACCESS_TOKEN_SECRET="your_access_secret"
JWT_REFRESH_TOKEN_SECRET="your_refresh_secret"
JWT_INVITE_TOKEN_SECRET="your_invite_secret"
JWT_ACCESS_TOKEN_EXPIRES_IN="15"
JWT_REFRESH_TOKEN_EXPIRES_IN="30"
JWT_INVITE_TOKEN_EXPIRES_IN="10080"

CLOUDINARY_CLOUD_NAME="your_cloud"
CLOUDINARY_API_KEY="your_key"
CLOUDINARY_API_SECRET="your_secret"

REDIS_HOST="127.0.0.1"
REDIS_PORT="6379"
REDIS_TIMEOUT="500"

EMAIL_USER="example@gmail.com"
EMAIL_PASS="your-email-password"
EMAIL_FROM="No Reply <example@gmail.com>"

PORT="5010"
NODE_ENV="development"
CORS_ALLOWED_ORIGINS="http://localhost:5173,http://localhost"
SOCKET_ALLOWED_ORIGINS="http://localhost:5173,http://localhost"

OTP_EXPIRE_MINUTE="10"
OTP_BASE_URL="http://localhost:5010/api/v1"
PASSWORD_RESET_EXPIRE_IN="10"

DIRECT_REGISTER="TRUE"
TOKEN_REGISTER="TRUE"

BCRYPT_JS_SALT_ROUNDS="12"
PASSWORD_LENGTH="8"
```

---

## 13. Database Setup and Prisma Commands

### Install dependencies

```bash
npm install
```

### Generate Prisma client

```bash
npx prisma generate
```

### Create migration

```bash
npx prisma migrate dev --name init
```

### Apply migrations in production

```bash
npx prisma migrate deploy
```

### Push schema without migration

```bash
npx prisma db push
```

---

## 14. Running the Project

### Development

```bash
npm run dev
```

### Production build

```bash
npm run build
```

### Start production server

```bash
npm start
```

### Docker

```bash
docker-compose up --build
```

### Swagger docs

Open:

```text
http://localhost:5010/api/docs
```

### Health check

```text
http://localhost:5010/api/v1/health
```

---

## 15. Route Summary

### Global routes

- `GET /api/v1/health`
- `GET /api/v1/`
- `GET /api/docs`
- `GET /api/swagger.json`

### Auth routes

- `POST /api/v1/auth/register`
- `POST /api/v1/auth/register/instructorInfo/:token`
- `POST /api/v1/auth/register/userInfo/:token`
- `POST /api/v1/auth/verify-email`
- `GET /api/v1/auth/verify-email/:token`
- `POST /api/v1/auth/resend-verification`
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/refresh-token`
- `POST /api/v1/auth/logout`
- `POST /api/v1/auth/forgot-password`
- `GET /api/v1/auth/verify-forgot-password`
- `POST /api/v1/auth/verify-forgot-password`
- `GET /api/v1/auth/reset-password`
- `POST /api/v1/auth/reset-password`
- `GET /api/v1/auth/me`
- `GET /api/v1/auth/user-info`
- `POST /api/v1/auth/change-password`
- `POST /api/v1/auth/me`

### CMS routes

- `GET /api/v1/pages`
- `POST /api/v1/pages`
- `GET /api/v1/pages-section`
- `POST /api/v1/pages-section`
- `GET /api/v1/destination`
- `POST /api/v1/destination`
- `DELETE /api/v1/destination`
- `GET /api/v1/journeys`
- `POST /api/v1/journeys`
- `DELETE /api/v1/journeys`
- `GET /api/v1/journeys-overview`
- `POST /api/v1/journeys-overview`
- `GET /api/v1/journeys-itinerary`
- `POST /api/v1/journeys-itinerary`
- `GET /api/v1/journeys-includes`
- `POST /api/v1/journeys-includes`
- `GET /api/v1/journeys-pricing`
- `POST /api/v1/journeys-pricing`
- `GET /api/v1/journeys-heading`
- `POST /api/v1/journeys-heading`

### Wishlist routes

- `GET /api/v1/wishlist`
- `POST /api/v1/wishlist`
- `DELETE /api/v1/wishlist`

---

## 16. Swagger and API Documentation

Swagger is wired in `src/docs/swagger/`.

### Main files

- `src/docs/swagger/swagger.ts`
- `src/docs/swagger/routeRegistry.ts`
- `src/docs/swagger/scanRoutes.ts`
- `src/docs/swagger/schemaRegistry.ts`
- `src/docs/swagger/zodToOpenAPI.ts`
- `src/docs/swagger/openapi.builder.ts`

### Available docs URLs

- Swagger UI: `/api/docs`
- Raw JSON: `/api/swagger.json`

---

## 17. Redis and Caching

Redis is used in shared read/write services.

### Behavior

- GET requests try Redis cache first
- successful responses are cached
- create/update/delete invalidate relevant cache keys
- cache keys are tagged by model

### Why it matters

This improves performance for repeated read requests such as pages, destinations, journeys, and wishlist lists.

---

## 18. File Upload Flow

File uploads are handled through:

- `multer.middleware.ts`
- `upload_cloudinary.service.ts`
- `manageRecordWithFiles.service.ts`

### Flow

1. Request arrives with multipart/form-data
2. `uploadFile()` middleware parses files
3. File size/type validation is performed
4. `manageRecordWithFiles` uploads files to Cloudinary
5. Cloudinary URL is stored in Prisma model array fields
6. Old files can be removed via `fileRemove`

### Supported upload types

- image
- video
- audio
- file

---

## 19. Error Handling

Errors are standardized by:

- `ApiError` custom class
- `catchAsync` wrapper
- global error middleware in `src/middlewares/error.middleware.ts`

### Response style

All successful responses use `successResponse` and all errors go through centralized error handling.

---

## 20. How to Add a New Feature Module

A new module can be added by following this template:

1. Create folder under `src/modules/<moduleName>/`
2. Add:
   - `moduleName.routes.ts`
   - `moduleName.controller.ts`
   - `moduleName.service.ts`
   - `moduleName.validator.ts`
3. Add Prisma model to `prisma/schema/`
4. Run Prisma migration
5. Register router in `bootstraps.ts`
6. Attach middlewares in route file
7. Add Swagger-compatible validation / metadata

### Recommended pattern

```ts
router.get("/", publicApiLimiter, validate(getSchema), getController);
router.post(
  "/",
  protect,
  publicApiLimiter,
  accessMiddleware("resourceName"),
  ...uploadFile(),
  validate(manageSchema),
  manageController,
);
```

---

## 21. Notes for Future Development

This codebase is already structured in a reusable way, so adding new modules is relatively straightforward.

Best practices for future work:

- Keep business logic in service files
- Keep controllers thin
- Use shared utilities wherever possible
- Keep Prisma relations explicit
- Add Zod schemas for all incoming requests
- Add permission definitions for new resources
- Add audit logs for sensitive changes

---

## 22. Summary

This backend is built around a clean layered architecture:

- Express app layer
- Middleware layer
- Router layer
- Controller layer
- Service layer
- Shared utility layer
- Prisma database layer

It already supports:

- auth
- CMS content management
- media upload
- RBAC-style permission checks
- Redis cache
- Swagger docs
- Socket.IO
- logging and error handling

If you want, next step holo eta ke আরও একদম production-grade style-এ convert করা, jekhane:

- OpenAPI docs full auto-generation
- admin panel routes
- reservation module full CRUD
- payment integration
- review module
- test coverage improvement
- Docker production optimization

---

## 23. Quick Start Commands

```bash
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run dev
```

Happy coding.

### Main route groups

- `/api/v1/auth`
- `/api/v1/pages`
- `/api/v1/pages-section`
- `/api/v1/destination`
- `/api/v1/journeys`
- `/api/v1/journeys-overview`
- `/api/v1/journeys-itinerary`
- `/api/v1/journeys-includes`
- `/api/v1/journeys-pricing`
- `/api/v1/journeys-heading`
- `/api/v1/wishlist`

## Architecture

- `app.ts` sets up Express, middleware, Socket.IO, and Swagger
- `index.ts` starts the HTTP server, connects Prisma and Redis, and handles graceful shutdown
- `bootstraps.ts` mounts route modules and enables the custom OpenAPI route registry
- `src/config/prisma.ts` initializes a global Prisma client
- `src/config/redis.ts` manages Redis connection lifecycle
- `src/middlewares/zod.middleware.ts` validates requests with Zod and attaches `req.validated`
- `src/middlewares/multer.middleware.ts` handles multipart uploads and exposes form-data metadata for Swagger
- `src/docs/swagger/` scans mounted routes and builds OpenAPI docs dynamically

## How Swagger generation works

The Swagger builder uses the mounted route registry to inspect each route and its middleware stack. It extracts:

- path parameters from Express route definitions
- Zod validation schemas attached to route handlers
- multipart/form-data upload metadata from multer middleware

This allows the server to publish an up-to-date API spec without maintaining a separate Swagger file.

## Testing

Run the full test flow using:

```bash
npm test
```

The command runs test database cleanup, seeds test users, executes Jest tests, and clears test data again.

## Notes

- Static files are served from `public/`
- The server supports CORS and common security middleware like helmet, hpp, and XSS sanitization
- Socket.IO connections require JWT auth through the WebSocket handshake
- Redis is optional; if config is missing, the server logs a warning and continues

## Project Structure

```text
.
├── app.ts
├── index.ts
├── bootstraps.ts
├── package.json
├── tsconfig.json
├── prisma/
│   ├── schema/
│   └── migrations/
├── src/
│   ├── config/
│   ├── docs/
│   │   └── swagger/
│   ├── middlewares/
│   ├── modules/
│   ├── shared/
│   └── utils/
├── public/
├── tests/
└── .env.example
```

## Contribution

- Add new routes in `src/modules`
- Register new route groups in `bootstraps.ts`
- Add Zod schemas and `validate()` middleware to expose OpenAPI metadata
- Keep shared services in `src/shared` and utilities in `src/utils`

## License

No license is specified in this repository. Add one to `package.json` if needed.
