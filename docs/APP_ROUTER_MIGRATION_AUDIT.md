# Next.js App Router Migration Audit: VinTrack (Partspeddle-FE)

## Executive Summary

The **VinTrack (Partspeddle-FE)** application is currently **NOT a Next.js application**. It is architected as a **Vite SPA (Single Page Application)** with a custom **Express.js** backend. 

While a top-level `app/api` directory exists containing Next.js App Router style `route.ts` files, these are currently **orphaned/non-functional** as there is no `next` dependency in `package.json`, no `next.config.js`, and the server entry point is a custom `server.ts` using Express.

**Current Routing Architecture:** Vite + React Router DOM v7 (Client-side) & Express.js (Server-side).

---

## Route Statistics

| Metric | Count |
| --- | --- |
| **Vite / React Router Routes** | 6 |
| **Express API Routes** | 12 |
| **Ghost App Router Routes (Non-functional)** | 2 |
| **Pages Router Routes** | 0 |

---

## Deprecated Routes & Migration Mapping

The following routes will be deprecated in their current form and migrated to the App Router structure.

| Current Route (Vite/Express) | Target App Router Path | Status |
| --- | --- | --- |
| `/` (Homepage) | `app/(public)/page.tsx` | Migrate |
| `/listing` (All Parts) | `app/(public)/search/page.tsx` | Migrate |
| `/detail/:id` | `app/(public)/listing/[id]/page.tsx` | Migrate |
| `/auth` | `app/(auth)/login/page.tsx` | Split/Migrate |
| `/dashboard/*` | `app/(dashboard)/dashboard/...` | Refactor to Route Groups |
| `/library` | `app/(public)/library/page.tsx` | Migrate (Dev only) |
| `server.ts` (All `/api/*`) | `app/api/*` | Deprecate Express |

---

## Required Redirects

To maintain SEO and user experience during/after migration, the following redirects will be implemented via `next.config.js` or `middleware.ts`:

| Source Path | Destination Path | Reason |
| --- | --- | --- |
| `/listing` | `/search` | URL Standardization |
| `/detail/:id` | `/listing/:id` | Restful naming convention |
| `/auth` | `/login` | Explicit auth routes |
| `/dashboard` (Unauth) | `/login` | Auth Protection |
| `/admin` (Unauthorized) | `/dashboard` | Role-based Protection |

---

## Phase 1: Routing Discovery

### Route Inventory

| Route | File | Router Type |
| --- | --- | --- |
| `/` | `src/App.tsx` | React Router (SPA) |
| `/listing` | `src/App.tsx` | React Router (SPA) |
| `/detail/:id` | `src/App.tsx` | React Router (SPA) |
| `/auth` | `src/App.tsx` | React Router (SPA) |
| `/dashboard/*` | `src/App.tsx` | React Router (SPA) |
| `/library` | `src/App.tsx` | React Router (SPA) |
| `/api/health` | `server.ts` | Express API |
| `/api/search/parts` | `server.ts` | Express API |
| `/api/search/suggestions` | `server.ts` | Express API |
| `/api/search/events` | `server.ts` | Express API |
| `/api/search/clicks` | `server.ts` | Express API |
| `/admin/search/reindex` | `server.ts` | Express API |
| `/api/parts/featured` | `server.ts` | Express API |
| `/api/sellers/top` | `server.ts` | Express API |
| `/api/gemini/identify` | `server.ts` | Express API |
| `/api/seller/profile` | `server.ts` | Express API |
| `/api/seller/upload-logo` | `server.ts` | Express API |

### Ghost App Router Routes
These files exist in the file system but are not currently integrated into the running application's routing logic.

| Route | File | Router Type |
| --- | --- | --- |
| `/api/gemini/identify` | `app/api/gemini/identify/route.ts` | App Router (Draft) |
| `/api/seller/upload-logo` | `app/api/seller/upload-logo/route.ts` | App Router (Draft) |

---

## Phase 2: Architecture Analysis

### Determine Current State

**Classification:** `Pages Router Dominant` (as per user-provided options), technically **Vite SPA**.

**Justification:** 
The application does not use Next.js. The primary routing is handled by `react-router-dom` in the client. If we must map this to Next.js terminology, it is closer to the "Pages Router" paradigm where routing and data fetching are decoupled from the server-side component tree, though technically it is a pure SPA. The presence of `app/api` suggests a migration was started or planned but never completed.

---

## Phase 3: Layout Audit

*   **Location:** `src/App.tsx`
*   **Structure:** A monolithic `AppContent` component wraps the entire application.
*   **Providers:** 
    *   `BrowserRouter` (React Router)
    *   `useAppStore` (Zustand)
    *   `Supabase Auth` (initialized in `useEffect`)
*   **Missing App Router Capabilities:**
    *   No `layout.tsx` (App Router style)
    *   No `loading.tsx`, `error.tsx`, or `not-found.tsx` in `app/`.
    *   Error boundaries are handled via a custom `ErrorBoundary` component in `src/`.

---

## Phase 4: Middleware Audit

*   **Status:** **NOT PRESENT**.
*   **Auth Logic:** Client-side redirection in `App.tsx` based on Supabase session state.
*   **Compatibility:** Moving to Next.js would allow replacing client-side auth guards with `middleware.ts` for improved security and performance (SSR).

---

## Phase 5: Search Platform Compatibility

*   **Search Route:** `/listing` (Client) -> `/api/search/parts` (Express API).
*   **Data Fetching:** Client-side `fetch` inside `ProductListing.tsx` or triggered via Zustand store.
*   **URL State Management:** Handled by `react-router-dom` and `useAppStore`.
*   **Readiness for Search Parameters:** Currently supports `q`, `makeId`, `modelId`, etc. via query strings parsed in `search-parts-handler.ts`.

---

## Phase 6: API Route Audit

*   **Legacy (Express):** All functional API routes are defined in `server.ts`.
*   **App Router (Draft):** `app/api/gemini/identify/route.ts` uses `NextResponse`, which is currently incompatible with the project's dependencies.

---

## Phase 7: Migration Risk Assessment

| Risk Level | Component | Reason |
| --- | --- | --- |
| **Low** | Static Pages | `Homepage`, `Footer`, `Navbar` are standard React components. |
| **Medium** | Auth Flow | Moving Supabase auth from client-side `useEffect` to NextAuth or Next.js middleware. |
| **High** | Search Platform | Complex state synchronization between URL, Zustand, and Algolia requires careful refactoring into Server Components. |
| **High** | AI Vision | The Gemini integration in `server.ts` is robust; migrating to Edge/Serverless functions requires quota and timeout management. |

---

## Phase 8: Final Recommendation

**Recommendation C: Full migration required.**

The application is currently a standard Vite/Express SPA. To move to Next.js App Router, the project needs:
1. Addition of `next`, `react`, `react-dom` (latest) to `package.json`.
2. Removal of `vite.config.ts` and `server.ts` in favor of `next.config.js`.
3. Refactoring of `src/App.tsx` routes into the `app/` directory structure.
4. Migration of Express API handlers to `app/api/*/route.ts`.
5. Adaptation of Zustand/Store logic to work with Server Components.
