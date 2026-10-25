# Poli Full Stack — AI Session Handover & Complete Work History
**Date**: October 25, 2026  
**Primary Repository**: `Poli Full stack` (`dashboard`, `mira_backend_v1`, `frontend`)  
**Purpose**: Seamless knowledge transfer across AI sessions and user accounts.

---

## 📌 Executive Summary for the Incoming AI Session

Welcome! You are continuing development on the **Poli Full Stack** project (consisting of the Admin Dashboard, Backend API, and Next.js Frontend).  
This document outlines everything built, configured, and standardized in recent sessions so you can pick up immediately with zero lost context.

### Essential Rules & Directives (NEVER VIOLATE)
1. **Rule 1 — Backend TypeScript Verification**:
   Whenever making any backend changes in `mira_backend_v1/`, **ALWAYS** run `npx tsc --noEmit` inside `mira_backend_v1/` to verify **0 errors** before completing your turn.
2. **Rule 2 — Master Documentation Maintenance**:
   Whenever any feature or task is implemented, **ALWAYS** update `docs/MASTER_INDEX.md` (and keep this handover doc updated).
3. **Rule 3 — Canonical Universal Multimedia Object**:
   Whenever creating or updating any multimedia default object in `empty*.ts` or CMS/Location configs (`leftMultimedia`, `backgroundMultimedia`, etc.), **ALWAYS** use the COMPLETE 4-section canonical object containing `show`, `color`, `image`, and `video` with all properties initialized (`url: ""`). Never omit video/image/overlay properties!
4. **Infinite Scroll Standard (No UI Tab Switcher)**:
   All listings and tables in the dashboard use **Infinite Scroll mode** by default. View mode is strictly code-driven (`mode="infinite"`). Do NOT render `Pages | Infinite` tab switcher toggles in the UI.

---

## 🏗️ Architecture & Active Ports

| Service | Technology | Port | Repository Git Remote |
| :--- | :--- | :--- | :--- |
| **Dashboard** | React 18, Vite, TypeScript, Tailwind CSS | `5173` | `git@github-dev-ali66:dev-ali66/tour-dashboard.git` (`main`) |
| **Backend** | Express, Hono, Prisma ORM, PostgreSQL | `5010` | `git@github-dev-ali66:dev-ali66/tour-server.git` (`main`) |
| **Frontend** | Next.js 14, React, Tailwind CSS | `3000` | `git@github-dev-ali66:sholayman99/next-level-project-go.git` (`main`) |

---

## 🚀 Key Accomplishments & Implemented Systems

### 1. Universal Infinite Scroll System Across All Dashboard Pages
- **The Problem Solved**:
  Previously, some listings jumped batches on load (e.g. showing 68 items instead of 20) due to `placeholderData` in TanStack Query where `isLoading` stayed `false` during subsequent fetches, causing rapid-fire intersection observer triggers.
- **The Core Solution**:
  - **`dashboard/src/hooks/ui/useListingPagination.ts`**:
    - Concurrency lock (`isFetchingMoreRef`) prevents simultaneous fetches.
    - Accurately tracks `isLoadingMore = isLoadingMore || (isFetching && currentPage > 1)`.
    - Handles deduplicated stream accumulation (`accumulatedItems`), filter cache invalidation (`filterKey`), and responsive layout calculations.
  - **`dashboard/src/components/shared/Pagination.tsx`**:
    - Default `mode = "infinite"`.
    - Sentinel with `rootMargin: "0px 0px 50px 0px"` and 100ms debounce.
    - Intelligent auto-fallbacks `effectiveHasMore` and `effectiveOnLoadMore`.
  - **100% Rollout Across ALL Pages**:
    - `Location/index.tsx` (Card Grid)
    - `Experience/index.tsx` (Card Grid)
    - `Journey/index.tsx` (Card Grid)
    - `Stories/index.tsx` (Card Grid)
    - `Inquiry/index.tsx` (Table)
    - `Bookings/BookingTable.tsx` (Table)
    - `UserList/UserListTable.tsx` (Table)
    - `Requests/JourneyWizardTable.tsx` (Table)
    - `Requests/RequestListTable.tsx` (Table)
    - `Reviews/index.tsx` (Cards)
    - `Promotions/index.tsx` (Table)
    - `Newsletter/index.tsx` (Table)
    - `MediaLibrary/MediaLibraryPage.tsx` (Grid & Table)
    - `MediaPickerModal.tsx` (Modal Grid)
    - `IAM/RolesTable.tsx` (Table)
    - `IAM/PermissionsTable.tsx` (Table)
    - `AuditLogs/index.tsx` (Table)

### 2. Media Library Runaway Infinite Scroll Fix & Defense-in-Depth Observer Latch
- **Issue Solved**:
  Scrolling in `/media-library` caused rapid-fire page changes (page 1 -> 2 -> 3 -> 4...) before data could load, endlessly looping.
- **Root Causes Fixed**:
  1. In `MediaLibraryPage.tsx`, `isLoadingMore={isFetching && meta.page > 1}` was evaluated against cached `galleryData.meta` (which stayed at page 1 while page 2 was in-flight due to TanStack Query `placeholderData`).
  2. Because `isLoadingMore` was `false`, `Pagination`'s IntersectionObserver fired repeatedly without latching.
  3. `MediaLibraryPage.tsx` was pushing `page` into `URLSearchParams`, causing continuous URL replacements and router navigation re-renders.
- **Implementation**:
  - `MediaLibraryPage.tsx`: Integrated canonical `useListingPagination<MediaAsset>`, passed `isLoading={isLoading && currentPage === 1}`, removed `page` from URL params, and connected `setIncomingData`.
  - `Pagination.tsx`: Added internal latch `hasTriggeredRef = useRef<boolean>(false)` which latches immediately on intersection and only resets when loading finishes (`!isLoadingMore`) or items arrive (`loadedCount`).
  - `MediaPickerModal.tsx`: Added `isFetchingMoreRef` concurrency guard.

### 3. Responsive Grid Alignment & Zero-Empty-Slot System
- **Formula**: `gridLimit = Math.ceil(targetItems / columns) * columns`
- **Hook**: `dashboard/src/hooks/ui/useGridColumns.ts` uses `ResizeObserver` on container DOM to read exact computed `gridTemplateColumns` count directly from the browser layout engine.
- Every row rendered in card grids is 100% filled with zero dangling or empty card slots.

### 3. Inquiries & Lead Management (`/api/v1/inquiry`)
- Dedicated backend inquiry module (`inquiry.prisma`, `inquiry.service.ts`, `inquiry.controller.ts`).
- Public API endpoint `POST /api/v1/inquiry` sends formatted notification email to admin via `emailHelper`.
- Full dashboard management page at `/inquiries`.

### 4. Canonical Story Relations & SEO
- Synchronized canonical keys: `locations`, `journeys`, `manualRelatedStories`, `practicalNotes`.
- Popover floating category dropdown with outside-click detection.

---

## 🛠️ How to Resume Work

1. Read [`docs/MASTER_INDEX.md`](file:///c:/Users/aalia/OneDrive/Desktop/Poli%20Full%20stack/docs/MASTER_INDEX.md) for detailed granular history.
2. To run dashboard: `cd dashboard && npm run dev` (runs on `http://localhost:5173`).
3. To run backend: `cd mira_backend_v1 && npm run dev` (runs on `http://localhost:5010`).
4. Verify builds before finishing:
   - Dashboard: `npm run build` in `dashboard/`
   - Backend: `npx tsc --noEmit` in `mira_backend_v1/`
