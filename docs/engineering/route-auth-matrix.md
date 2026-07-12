# Route × Role × Auth Mechanism Matrix

This matrix is the canonical reference for how every public page, protected page, and API route in PartsPeddle is authenticated and authorized. It is enforced by `src/proxy.ts` (page routes and defense-in-depth for API routes) and by the route-handler helpers in `src/lib/seller-auth.ts` and `src/lib/admin-auth.ts`.

---

## Legend

| Visibility      | Meaning                                                                |
| --------------- | ---------------------------------------------------------------------- |
| `public`        | No authentication required.                                            |
| `authenticated` | Requires a valid cookie session; role may further restrict access.     |
| `seller`        | Requires a cookie session whose canonical `user_roles.role` is seller. |
| `admin`         | Requires a cookie session whose canonical `user_roles.role` is admin.  |
| `machine`       | Requires an explicit M2M Bearer token (documented integrations only).  |

| Auth mechanism   | Where it is used                                                   |
| ---------------- | ------------------------------------------------------------------ |
| Cookie session   | Browser-initiated pages and APIs via `@supabase/ssr` + `proxy.ts`. |
| Bearer + service | Reserved for explicit machine-to-machine integrations.             |

---

## Page Routes

| Surface            | Example route(s)                              | Visibility    | Required role | Auth mechanism |
| ------------------ | --------------------------------------------- | ------------- | ------------- | -------------- |
| Marketing / home   | `/`                                           | public        | —             | —              |
| Public marketplace | `/search`, `/listing/[id]`, `/profile/[user]` | public        | —             | —              |
| Auth flows         | `/login`, `/register`, `/forgot-password`     | public        | —             | —              |
| Buyer dashboard    | `/dashboard`, `/dashboard/settings`           | authenticated | buyer+        | Cookie session |
| Seller workspace   | `/seller/*`, `/seller/listings/new`           | authenticated | seller        | Cookie session |
| Admin operations   | `/admin/*`, `/admin/scgs/dashboard/*`         | authenticated | admin         | Cookie session |

### Page-route behavior

| Condition                               | Response                                  |
| --------------------------------------- | ----------------------------------------- |
| Unauthenticated → `/dashboard`          | 307 redirect to `/login`                  |
| Unauthenticated → `/seller/*`           | 307 redirect to `/login`                  |
| Unauthenticated → `/admin/*`            | 307 redirect to `/login`                  |
| Buyer role → `/seller/*`                | 307 redirect to `/dashboard`              |
| Non-admin role → `/admin/*`             | 307 redirect to `/dashboard`              |
| Authenticated → `/login` or `/register` | 307 redirect to `/dashboard` or `/seller` |

---

## API Routes

| Surface     | Example route(s)                                | Visibility    | Required role | Auth mechanism   | Enforced by             |
| ----------- | ----------------------------------------------- | ------------- | ------------- | ---------------- | ----------------------- |
| Public API  | `/api/health`, `/api/parts/featured`            | public        | —             | —                | —                       |
| Buyer API   | `/api/profile`, `/api/notifications`            | authenticated | buyer+        | Cookie session   | Handler + proxy         |
| Seller API  | `/api/seller/inventory`, `/api/seller/drafts/*` | authenticated | seller        | Cookie session   | `requireSeller` + proxy |
| Admin API   | `/api/admin/search/reindex/*`                   | authenticated | admin         | Cookie session   | `requireAdmin` + proxy  |
| Machine API | (future webhooks / integrations)                | authenticated | —             | Bearer + service | `requireSellerMachine`  |

### API-route behavior

| Condition                     | Response                             |
| ----------------------------- | ------------------------------------ |
| No session → `/api/seller/*`  | 401 JSON `{ error: 'Unauthorized' }` |
| No session → `/api/admin/*`   | 401 JSON `{ error: 'Unauthorized' }` |
| Buyer/seller → `/api/admin/*` | 403 JSON `{ error: 'Forbidden' }`    |
| Buyer/admin → `/api/seller/*` | 403 JSON `{ error: 'Forbidden' }`    |

---

## Cookie-Session Conventions

All browser-initiated routes rely on the Supabase SSR cookie session managed in `src/proxy.ts`.

- Cookies are set with:
  - `httpOnly: true`
  - `secure: true` in production (`process.env.NODE_ENV === 'production'`)
  - `sameSite: 'lax'`
  - `path: '/'`
- Cookie refresh happens in `src/proxy.ts` via `setAll` so that refreshed tokens propagate to the browser before the request reaches route handlers.
- Route handlers use `createAuthClient(request)` from `src/lib/supabase-server.ts` for read-only session validation. They do not need to write cookies because `proxy.ts` handles refresh.

---

## Role Canonicalization

The canonical role is read from the `public.user_roles` table via `src/lib/user-roles.ts`. Auth checks must not rely on `user_metadata.role`. This is enforced by:

- `src/proxy.ts` for page routes.
- `requireSeller` in `src/lib/seller-auth.ts` for seller APIs.
- `requireAdmin` in `src/lib/admin-auth.ts` for admin APIs.

---

## Machine-to-Machine (M2M) Exceptions

Use `requireSellerMachine(req)` only for documented M2M integrations that cannot present a browser cookie session. It verifies a Bearer token against the service-role key. No browser-initiated `/api/seller/*` route should use this helper.

---

## Adding New Routes

1. Decide whether the route is `public`, `authenticated`, `seller`, or `admin`.
2. For page routes, ensure the path prefix is covered by `src/proxy.ts` and the matcher in `src/proxy.ts`.
3. For API routes, call the appropriate helper (`requireAuthenticated`, `requireSeller`, or `requireAdmin`) at the top of the handler.
4. Update this matrix before merging the new route.
