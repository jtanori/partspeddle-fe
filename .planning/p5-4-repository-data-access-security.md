# P5.4 — Repository and Data-Access Security

**Branch:** `feat/p5-4-repository-data-access-security`  
**Base:** `develop`  
**Goal:** Eliminate direct `supabaseAdmin` usage from the App Router and components by routing all data access through typed repositories, and enforce the rule: **browser → anon + RLS; server user context → SSR client; service role → repositories/background jobs only.**

---

## Current State

- `src/lib/supabase-admin.ts` exposes a lazy service-role client that is imported in **20+ files** under `src/app/` and `src/backend/`.
- Repository **interfaces** exist in `src/repositories/` (`catalog.repository.ts`, `listing.repository.ts`, `specification.repository.ts`) but have **no implementations**.
- Public Server Components fetch data with `supabaseAdmin`:
  - `src/app/(public)/page.tsx` (featured/recent parts, sellers)
  - `src/app/(public)/listing/[id]/page.tsx` (part + seller profile)
- Public API routes use `supabaseAdmin`:
  - `/api/parts/featured`
  - `/api/sellers/top`
  - `/api/taxonomy`
  - `/api/search/clicks`, `/api/search/events`
- Seller API routes use `supabaseAdmin` for reads/writes that should be scoped to the authenticated seller via RLS.
- Admin API routes use `supabaseAdmin` for reindexing.
- `src/lib/health-checks.ts` uses `supabaseAdmin` for a simple connectivity check.
- Storage uploads (`/api/seller/assets/upload`) write to a public bucket with service role and no path namespacing.

---

## Gaps

1. No enforced boundary between app-layer code and service-role data access.
2. Repository interfaces are stubs; all data access is ad-hoc `supabaseAdmin.from(...)`.
3. Public pages and APIs bypass RLS, so row-level policies are not exercised for public reads.
4. Seller-scoped queries rely on manual `.eq('seller_id', user.id)` rather than RLS.
5. Admin operations are not written to an audit log.
6. Storage uploads lack MIME/type validation, private buckets, seller-scoped paths, and signed URLs.
7. No branch test forbids new `supabaseAdmin` imports in `src/app/` or `src/components/`.

---

## Guiding Rule

| Caller context                               | Supabase client                                  | Where it is allowed                                        |
| -------------------------------------------- | ------------------------------------------------ | ---------------------------------------------------------- |
| Browser / Client Component                   | Anon key (`@supabase/ssr` browser client)        | `src/components/`, client hooks                            |
| Server Component / Route Handler with user   | SSR cookie-session client (`createServerClient`) | `src/app/`, `src/app/api/**`                               |
| Server Component / Route Handler public read | Anon key server client (RLS)                     | `src/app/(public)/**`, public APIs                         |
| Background worker / admin batch job          | Service role (`supabaseAdmin`)                   | `src/backend/**`, `src/repositories/impl/admin-*`, scripts |

**App code (`src/app/`, `src/components/`) must never import `supabaseAdmin` directly.**

---

## Work Items

### 1. Add shared server client helpers

Create `src/lib/supabase-server.ts`:

- `createServerSupabaseClient()` — cookie-session client for Route Handlers.
- `createAnonServerClient()` — anon-key client for public Server Components / public APIs.
- Re-export helpers so callers do not construct clients manually.

### 2. Implement repository layer

Create typed implementations under `src/repositories/impl/`:

| Repository            | Implementation                     | Client             | Notes                                                                |
| --------------------- | ---------------------------------- | ------------------ | -------------------------------------------------------------------- |
| `CatalogRepository`   | `supabase-catalog.repository.ts`   | anon               | Public taxonomy/category/spec reads.                                 |
| `ListingRepository`   | `supabase-listing.repository.ts`   | anon / SSR         | Public reads via anon; seller-scoped reads/writes via SSR.           |
| `SellerRepository`    | `supabase-seller.repository.ts`    | SSR / service role | Profile reads via SSR; admin actions via service role + audit.       |
| `AnalyticsRepository` | `supabase-analytics.repository.ts` | anon / SSR         | Search events/clicks; validate/authenticate IDs server-side.         |
| `AdminRepository`     | `supabase-admin.repository.ts`     | service role       | Batch reindex, moderation actions, audit-log writes.                 |
| `StorageRepository`   | `supabase-storage.repository.ts`   | service role       | Uploads with MIME/size validation, seller-scoped paths, signed URLs. |

Introduce a factory that picks the right client set based on context:

```ts
// src/repositories/factory.ts
export function createRepositories(ctx: 'public' | 'authenticated' | 'admin') { ... }
```

### 3. Migrate public Server Components

- `src/app/(public)/page.tsx`: replace `supabaseAdmin` with `createAnonServerClient()` + `ListingRepository` / `SellerRepository`.
- `src/app/(public)/listing/[id]/page.tsx`: replace `supabaseAdmin` with anon `ListingRepository.findById` and `SellerRepository`.
- Remove the mock repository implementations currently inlined in `listing/[id]/page.tsx`; wire real repositories.

### 4. Migrate public API routes

Replace `supabaseAdmin` with anon repositories:

- `/api/parts/featured`
- `/api/sellers/top`
- `/api/taxonomy`
- `/api/search/clicks` / `/api/search/events` (use anon or authenticated client; validate IDs server-side)

### 5. Migrate seller API routes

After P5.2 aligns seller auth with cookie sessions, update these routes to use the authenticated SSR repository set:

- `/api/seller/inventory`
- `/api/seller/profile`
- `/api/seller/drafts/active`
- `/api/seller/drafts/[id]`
- `/api/seller/drafts/[id]/publish`
- `/api/seller/drafts/[id]/discard`
- `/api/seller/inventory/commit`

Delete manual `.eq('seller_id', user.id)` where RLS now enforces it; keep it only as defense-in-depth where documented.

### 6. Migrate admin API routes

- `/api/admin/search/reindex` → `AdminRepository` (service role) + write an audit-log row (`admin_actions` table or existing `audit_log`).
- `/api/admin/search/reindex/[partId]` → same.

### 7. Secure storage uploads

In `src/repositories/impl/supabase-storage.repository.ts` and the upload routes:

- Validate MIME type (`image/jpeg`, `image/png`, `image/webp`) and file size (e.g., 20 MB).
- Use path namespacing: `yards/{sellerId}/{uuid}.{ext}`.
- Prefer private bucket + signed URL over public URL.
- Return the signed URL and persist the storage path in the listing/part record.

### 8. Update health checks

- `src/lib/health-checks.ts`: keep service role for the connectivity probe but move it behind a `HealthCheckRepository` implementation and document the exception.

### 9. Add enforcement and tests

- Add an ESLint / branch-test rule that fails on `import { supabaseAdmin } from '@/lib/supabase-admin'` in `src/app/` or `src/components/`.
- Add branch tests under `tests/branch/p5-4-repository-data-access-security/`:
  - No `supabaseAdmin` imports remain in migrated app files.
  - Public listing read works through anon client/RLS.
  - Seller A cannot fetch Seller B inventory via authenticated repository.
  - Admin reindex writes an audit row.
  - Storage upload rejects oversized / invalid MIME files.

### 10. Document the data-access model

Create or update `docs/DATA_ACCESS.md`:

- The client-selection matrix above.
- Repository directory layout and how to add a new repository.
- List of documented service-role exceptions (health check, admin batch jobs, background search worker).
- Storage upload conventions.

---

## Suggested Rollout Order

1. **Foundation:** server client helpers + repository factory + ESLint/branch-test guard.
2. **Public reads:** migrate homepage and PDP to anon repositories.
3. **Public APIs:** migrate featured, sellers, taxonomy, search analytics.
4. **Seller APIs:** migrate after P5.2 cookie-session auth is complete.
5. **Admin + storage:** migrate reindex and storage uploads.
6. **Cleanup:** remove remaining ad-hoc `supabaseAdmin.from(...)` calls and update docs.

---

## Acceptance Criteria

- [ ] `src/lib/supabase-server.ts` exists with `createServerSupabaseClient()` and `createAnonServerClient()`.
- [ ] Repository implementations exist for catalog, listing, seller, analytics, admin, and storage.
- [ ] No `supabaseAdmin` imports remain in `src/app/` or `src/components/` except documented exceptions.
- [ ] Public pages and APIs use anon-key / RLS repositories.
- [ ] Seller APIs use authenticated SSR repositories.
- [ ] Admin batch operations write to an audit log.
- [ ] Storage uploads validate MIME/size, use seller-scoped paths, and return signed URLs.
- [ ] Branch tests enforce the no-service-role-in-app rule and verify tenant isolation.
- [ ] `pnpm test`, `pnpm lint`, and `pnpm typecheck` pass.

---

## Dependencies

- **Blocked by:** P5.1 (route groups stable), P5.2 (seller cookie-session auth aligned), P5.3 (API input validation stable).
- **Unblocks:** P5.5 (secrets/env audit), P5.7 (RLS alignment), P6.4 (service-role removal from public routes), P5.8 (security certification).

---

## Risks

- RLS policies must be correct before switching public reads to anon; otherwise public data may disappear. Validate against staging first.
- Seller-scoped RLS may not exist for all tables; coordinate with P5.7 / P4.6 to add missing policies.
- Repository refactor touches many files; prefer small stacked PRs (public → seller → admin/storage) rather than one giant branch.
- Storage path change from public URLs to signed URLs requires UI updates wherever image URLs are rendered.
