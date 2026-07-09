# VinTrack Next.js App Router Architecture

## Overview

This document outlines the standardized Next.js App Router architecture for the VinTrack (Partspeddle-FE) application. This architecture supports a hybrid marketplace with distinct experiences for buyers, sellers, and administrators.

---

## Directory Structure (src/app/)

The application uses **Route Groups** to organize layouts and access levels without affecting the URL structure.

```text
src/app/
│
├── (public)/              # Unauthenticated buyer experience
│   ├── search/            # Algolia-powered part search
│   ├── listing/[id]/      # Detailed part view
│   ├── profile/[username]/ # Seller public profiles
│   ├── help/              # Support & Docs
│   ├── loading.tsx        # Standard full-page loading state
│   └── page.tsx           # Landing Page
│
├── (auth)/                # Authentication flows
│   ├── login/
│   ├── register/
│   ├── forgot-password/
│   └── reset-password/
│
├── (dashboard)/           # Protected buyer/general dashboard
│   ├── profile/
│   ├── settings/
│   └── notifications/
│
├── (seller)/              # Seller-specific operations
│   ├── listings/
│   │   ├── new/
│   │   └── [id]/
│   ├── orders/
│   └── analytics/
│
├── (admin)/               # System administration
│   ├── users/
│   ├── listings/
│   ├── search/            # Search index management
│   └── scgs/dashboard/[category]/  # SCGS observability dashboard
│
├── api/                   # Route Handlers (Express replacement)
│   ├── search/
│   ├── gemini/            # AI Vision endpoints
│   └── auth/              # Supabase/NextAuth integration
│
├── layout.tsx             # Root Layout (Providers, Global CSS)
├── loading.tsx            # Global Loading State
├── error.tsx              # Global Error Boundary
├── not-found.tsx          # 404 Handler
└── page.tsx               # Root Entry Point
```

---

## Layout Hierarchy

### Root Layout (`app/layout.tsx`)

- **Providers:** Supabase Provider, Zustand Bridge, Theme Provider, Analytics.
- **Global Overlays:** `UIOverlays` renders the cart drawer, info modals, search modal, guided tour, and global help button once for the whole app.
- **SEO:** Default metadata configuration.
- **No page chrome:** The root layout does not render the navbar or footer; each route group owns its own shell.

### Public Shell (`src/components/layout/PublicShell.tsx`)

- Shared wrapper used by `(public)`, `(dashboard)`, and `(seller)` route groups.
- Renders the global `Navbar` (including mobile navigation and bottom tab bar) and optional `Footer`.
- Keeps global state wiring for search, cart, user role, and seller tabs.

### Auth Layout (`(auth)/layout.tsx`)

- Centered card layout for auth forms via `AuthPageShell`.
- No public navbar or footer.

### Public Layout (`(public)/layout.tsx`)

- Wraps marketplace pages in `PublicShell` with the footer visible.
- Homepage lives at `(public)/page.tsx` so `/` uses the public shell.

### Dashboard Layout (`(dashboard)/layout.tsx`)

- Wraps dashboard pages in `PublicShell showFooter={false}`.
- Persistent sidebar for dashboard navigation; the shared `Navbar` provides global chrome.

### Seller Layout (`(seller)/layout.tsx`)

- Wraps seller pages in `PublicShell showFooter={false}`.
- `SellerSidebar` and `DashboardHeader` provide seller-specific chrome below the shared `Navbar`.

### Admin Layout (`(admin)/layout.tsx`)

- Minimal wrapper for admin/ops pages (e.g., SCGS dashboards).
- Does not include the public navbar.

---

## Middleware & Security (`src/proxy.ts`)

The proxy middleware enforces authentication and role-based access control (RBAC) for page routes and provides defense-in-depth for API routes. All browser-initiated routes use cookie sessions via `@supabase/ssr`; canonical roles are read from `public.user_roles` through `src/lib/user-roles.ts`.

See [`docs/ROUTE_AUTH_MATRIX.md`](./ROUTE_AUTH_MATRIX.md) for the complete route × role × auth mechanism matrix.

### Page routes

| Path Pattern   | Requirement    | Redirect if Failed        |
| -------------- | -------------- | ------------------------- |
| `/dashboard/*` | Authenticated  | `/login`                  |
| `/seller/*`    | Role: `seller` | `/dashboard` (with alert) |
| `/admin/*`     | Role: `admin`  | `/dashboard`              |

### API routes

| Path Pattern    | Unauthenticated | Wrong role |
| --------------- | --------------- | ---------- |
| `/api/seller/*` | 401 JSON        | 403 JSON   |
| `/api/admin/*`  | 401 JSON        | 403 JSON   |

### Session cookie hardening

Cookies refreshed by the proxy are explicitly set with:

- `httpOnly: true`
- `secure: true` in production
- `sameSite: 'lax'`
- `path: '/'`

---

## Search Integration Strategy

### Primary Route: `/search`

The search page is a **Client Component** (due to heavy interactivity) but benefits from **Server-Side Rendering (SSR)** for the initial hit.

- **URL State:** Synchronized with Algolia via `next/navigation` (query params).
- **Faceting/Filtering:** Dynamic filters based on Algolia index attributes.
- **Performance:** Dynamic imports for heavy filter panels and map views.

### Example URL Patterns:

- `search?q=mustang`: Basic keyword search.
- `search?year=1967&make=Ford`: Filtered search.
- `search?q=mustang&page=2`: Pagination state.

---

## Data Fetching Standards

1.  **Server Components (Default):** Use for initial page data, SEO-sensitive content, and static data fetching.
2.  **Client Components:** Use for forms, real-time updates (Supabase subscriptions), and complex search state management.
3.  **Server Actions:** Use for data mutations (Listing creation, Profile updates) to enable progressive enhancement.

---

## SEO & Metadata

Publicly accessible routes implement `generateMetadata()` for dynamic SEO:

- `search`: Dynamic title based on query.
- `listing/[id]`: Part title, description, and OG images.
- `profile/[username]`: Seller business name and reputation data.

---

## Loading States

Use the canonical `Skeleton` component and its composite variants instead of one-off spinners:

- **`Skeleton`** — generic pulse placeholder for blocks, text, and images.
- **`Skeleton.PartCard`**, **`Skeleton.SellerCard`**, **`Skeleton.SearchResult`** — layout-specific skeletons for marketplace shells.

Use these inside `loading.tsx` files and `<Suspense>` fallbacks for search results and data-heavy dashboard widgets.

---

## Performance Targets

- **Route Splitting:** Automatic splitting per page folder.
- **Lazy Loading:** `dynamic(() => import(...))` for Admin and Analytics components.
- **Streaming:** Use `loading.tsx` and `<Suspense>` for search results and data-heavy dashboard widgets.
