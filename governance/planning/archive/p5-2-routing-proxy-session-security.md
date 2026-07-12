# P5.2 — Routing, Proxy, and Session Security

**Branch:** `feat/p5-2-routing-proxy-session-security`  
**Base:** `develop`  
**Goal:** Publish a canonical route × role × auth matrix and align all browser-initiated seller/admin APIs with cookie-based `@supabase/ssr` sessions.

---

## Current State

- `src/proxy.ts` protects page routes under `/dashboard`, `/seller`, and `/admin` using `@supabase/ssr` cookie sessions and `getUserRole()`.
- `src/lib/admin-auth.ts` uses cookie sessions for admin route handlers.
- `src/lib/seller-auth.ts` currently uses **Bearer token + `supabaseAdmin` service role**, which bypasses RLS and is inconsistent with the page-route auth model.
- No documented route × role × auth-mechanism matrix exists.
- Session cookie options (`HttpOnly`, `Secure`, `SameSite`) rely on Supabase SSR defaults and are not explicitly verified in code.

---

## Gaps

1. Seller APIs authenticate via Bearer/service role instead of cookie sessions.
2. API routes have no shared defense-in-depth unauthenticated check at the handler boundary.
3. No published matrix mapping pages/APIs to required role and auth mechanism.
4. Proxy matcher does not explicitly cover new `(admin)` route-group pages (functionally covered by `/admin` prefix, but not documented).
5. Cookie hardening settings are implicit.
6. No branch-level tests assert RBAC redirects or API 401/403 behavior.

---

## Work Items

### 1. Publish route × role × auth matrix

Create or update `docs/NEXT_APP_ROUTER_ARCHITECTURE.md` with a matrix:

| Surface          | Example route                              | Visibility           | Required role | Auth mechanism        |
| ---------------- | ------------------------------------------ | -------------------- | ------------- | --------------------- |
| Public page      | `/`, `/search`, `/listing/[id]`            | public               | —             | —                     |
| Auth page        | `/login`, `/register`                      | public               | —             | —                     |
| Buyer dashboard  | `/dashboard`                               | authenticated        | `buyer`+      | cookie session        |
| Seller workspace | `/seller/*`                                | authenticated        | `seller`      | cookie session        |
| Admin ops        | `/admin/scgs/*`                            | authenticated        | `admin`       | cookie session        |
| Public API       | `/api/parts/featured`, `/api/search/parts` | public               | —             | —                     |
| Buyer API        | `/api/health`                              | public/authenticated | —             | —                     |
| Seller API       | `/api/seller/*`                            | authenticated        | `seller`      | cookie session        |
| Admin API        | `/api/admin/*`                             | authenticated        | `admin`       | cookie session        |
| Machine API      | (future)                                   | authenticated        | —             | Bearer + service role |

### 2. Refactor `src/lib/seller-auth.ts`

- Add `requireSeller(request)` variant that builds a `@supabase/ssr` cookie-session client, calls `getUser()`, verifies the user, then checks `user_roles.role === 'seller'`.
- Keep a clearly named `requireSellerMachine(request)` helper that validates a Bearer token against `supabaseAdmin` for explicit machine-to-machine routes only.
- Export a shared `requireAuthenticated(request)` helper that returns 401 for unauthenticated callers.

### 3. Migrate `/api/seller/*` routes to cookie sessions

Update the following routes to use the new cookie-based `requireSeller` and, where possible, an authenticated SSR client instead of `supabaseAdmin`:

- `src/app/api/seller/inventory/route.ts`
- `src/app/api/seller/inventory/commit/route.ts`
- `src/app/api/seller/profile/route.ts`
- `src/app/api/seller/drafts/active/route.ts`
- `src/app/api/seller/drafts/[id]/route.ts`
- `src/app/api/seller/drafts/[id]/publish/route.ts`
- `src/app/api/seller/drafts/[id]/discard/route.ts`
- `src/app/api/seller/assets/upload/route.ts`

Where an operation legitimately needs elevated privileges (e.g., RPCs that bypass RLS), document the exception in the route and keep service-role use minimal.

### 4. Add API defense-in-depth checks

- Apply `requireAuthenticated` to all `/api/seller/*` and `/api/admin/*` handlers before role checks.
- Ensure admin routes use `requireAdmin` and return 403 for non-admin roles.

### 5. Harden session cookies

In `src/proxy.ts`, `src/lib/admin-auth.ts`, and the new cookie-based seller helper, explicitly pass cookie options in `setAll`:

```ts
response.cookies.set(name, value, {
  ...options,
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  path: '/',
});
```

Also verify the Supabase refresh path works through `proxy.ts` without redirect loops.

### 6. Extend proxy coverage and tests

- Confirm `proxy.ts` matcher covers `/admin/*` (it does via prefix match).
- Add branch tests under `tests/branch/p5-2-routing-proxy-session-security/`:
  - Unauthenticated requests to `/dashboard`, `/seller`, `/admin` redirect to `/login`.
  - Buyer role accessing `/seller` redirects to `/dashboard`.
  - Non-admin role accessing `/admin` redirects to `/dashboard`.
  - Logged-in user accessing `/login` or `/register` redirects away.
  - `GET /api/seller/inventory` without session returns 401.
  - `GET /api/admin/search/reindex` without session returns 401; with buyer/seller session returns 403.
  - Cookie refresh path does not produce a redirect loop.

### 7. Update documentation

- Update `docs/ROUTE_INVENTORY.md` with auth/role annotations.
- Update `docs/NEXT_APP_ROUTER_ARCHITECTURE.md` with the matrix and cookie-session conventions.

---

## Acceptance Criteria

- [ ] Route × role × auth matrix exists in `docs/NEXT_APP_ROUTER_ARCHITECTURE.md`.
- [ ] All browser-initiated `/api/seller/*` routes use cookie-based `requireSeller`.
- [ ] `supabaseAdmin` usage in seller routes is removed except for documented exceptions.
- [ ] `requireAdmin` returns 403 for non-admin sessions.
- [ ] Session cookies explicitly set `httpOnly`, `secure`, `sameSite`.
- [ ] Branch tests cover page redirects and API 401/403 behavior.
- [ ] `pnpm test` passes (run by CI/operator per `AGENTS.md`).
- [ ] `pnpm lint` and `pnpm typecheck` pass.

---

## Dependencies

- **Blocked by:** P5.1 (route groups stable; handler locations stable).
- **Unblocks:** P5.3 (API validation builds on authenticated handlers), P5.4 (data-access containment), P5.8 (security certification).

---

## Risks

- Switching seller APIs from Bearer to cookies may break any non-browser consumers; confirm all seller API callers are browser fetch.
- `supabaseAdmin` removal from seller reads may expose missing RLS policies; coordinate with P5.7 / P6.
