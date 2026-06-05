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
│   └── search/            # Search index management
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
*   **Providers:** Supabase Provider, Zustand Bridge, Theme Provider, Analytics.
*   **Global Elements:** Toast containers, Modal roots.
*   **SEO:** Default metadata configuration.

### Auth Layout (`(auth)/layout.tsx`)
*   Centered card layout for auth forms.
*   Branding/Logo focus.

### Dashboard Layout (`(dashboard)/layout.tsx`)
*   Persistent sidebar for navigation.
*   Global header with search and user menu.
*   Notification indicators.

### Seller Layout (`(seller)/layout.tsx`)
*   Seller-specific navigation (Inventory, Orders, Analytics).
*   Contextual listing shortcuts.

---

## Middleware & Security (`middleware.ts`)

The middleware enforces authentication and role-based access control (RBAC).

| Path Pattern | Requirement | Redirect if Failed |
| --- | --- | --- |
| `/dashboard/*` | Authenticated | `/login` |
| `/seller/*` | Role: `seller` | `/dashboard` (with alert) |
| `/admin/*` | Role: `admin` | `/dashboard` |

---

## Search Integration Strategy

### Primary Route: `/search`
The search page is a **Client Component** (due to heavy interactivity) but benefits from **Server-Side Rendering (SSR)** for the initial hit.

*   **URL State:** Synchronized with Algolia via `next/navigation` (query params).
*   **Faceting/Filtering:** Dynamic filters based on Algolia index attributes.
*   **Performance:** Dynamic imports for heavy filter panels and map views.

### Example URL Patterns:
*   `search?q=mustang`: Basic keyword search.
*   `search?year=1967&make=Ford`: Filtered search.
*   `search?q=mustang&page=2`: Pagination state.

---

## Data Fetching Standards

1.  **Server Components (Default):** Use for initial page data, SEO-sensitive content, and static data fetching.
2.  **Client Components:** Use for forms, real-time updates (Supabase subscriptions), and complex search state management.
3.  **Server Actions:** Use for data mutations (Listing creation, Profile updates) to enable progressive enhancement.

---

## SEO & Metadata

Publicly accessible routes implement `generateMetadata()` for dynamic SEO:
*   `search`: Dynamic title based on query.
*   `listing/[id]`: Part title, description, and OG images.
*   `profile/[username]`: Seller business name and reputation data.

---

## Performance Targets
*   **Route Splitting:** Automatic splitting per page folder.
*   **Lazy Loading:** `dynamic(() => import(...))` for Admin and Analytics components.
*   **Streaming:** Use `loading.tsx` and `<Suspense>` for search results and data-heavy dashboard widgets.
