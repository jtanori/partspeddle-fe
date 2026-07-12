# Data-Access Governance

This document defines how PartsPeddle code accesses Supabase data and when service-role access is permitted.

---

## Client Selection Matrix

| Caller context                               | Supabase client                                   | Where it is allowed                                                          |
| -------------------------------------------- | ------------------------------------------------- | ---------------------------------------------------------------------------- |
| Browser / Client Component                   | Anon key (`@supabase/ssr` browser client)         | `apps/web/src/components/`, client hooks                                     |
| Server Component / Route Handler with user   | SSR cookie-session client (`createAuthClient`)    | `apps/web/src/app/`, `apps/web/src/app/api/**`                               |
| Server Component / Route Handler public read | Anon-key server client (`createAnonServerClient`) | `apps/web/src/app/(public)/**`, public APIs                                  |
| Background worker / admin batch job          | Service role (`supabaseAdmin`)                    | `apps/web/src/backend/**`, `apps/web/src/repositories/impl/admin-*`, scripts |

**Rule:** `apps/web/src/app/` and `apps/web/src/components/` must never import `supabaseAdmin` directly except for the documented exceptions below.

---

## Repository Layout

| Repository          | Implementation                                                  | Client     | Notes                                                   |
| ------------------- | --------------------------------------------------------------- | ---------- | ------------------------------------------------------- |
| `CatalogRepository` | `apps/web/src/repositories/impl/supabase-catalog.repository.ts` | anon       | Public taxonomy/category/spec reads.                    |
| `ListingRepository` | `apps/web/src/repositories/impl/supabase-listing.repository.ts` | anon / SSR | Public reads via anon; seller-scoped via SSR.           |
| `SellerRepository`  | `apps/web/src/repositories/impl/supabase-seller.repository.ts`  | anon / SSR | Public seller profile reads; admin actions via service. |

Create new repositories under `apps/web/src/repositories/impl/` and add them to `apps/web/src/repositories/factory.ts`.

---

## Service-role exceptions in `apps/web/src/app/`

The following API routes import `@/lib/supabase-admin` for justified reasons. All other app code must use the repository factory or `createAuthClient`/`createAnonServerClient`.

| File                                                          | Justification                                            |
| ------------------------------------------------------------- | -------------------------------------------------------- |
| `apps/web/src/app/api/seller/assets/upload/route.ts`          | Storage upload to public bucket; path namespacing.       |
| `apps/web/src/app/api/seller/upload-logo/route.ts`            | Storage upload for seller logo; path namespacing.        |
| `apps/web/src/app/api/seller/inventory/commit/route.ts`       | Executes `commit_inventory_package` RPC.                 |
| `apps/web/src/app/api/seller/drafts/[id]/publish/route.ts`    | Executes `publish_listing_draft` RPC.                    |
| `apps/web/src/app/api/admin/search/reindex/route.ts`          | Admin batch reindex operation.                           |
| `apps/web/src/app/api/admin/search/reindex/[partId]/route.ts` | Admin batch reindex operation.                           |
| `apps/web/src/app/api/seller/profile/route.ts`                | Updates `users` and `seller_profiles` tables atomically. |

---

## Storage Upload Conventions

- Allowed MIME types: `image/jpeg`, `image/png`, `image/webp`.
- Max file size: 20 MB for assets, 5 MB for logos.
- Path namespacing: `yards/{sellerId}/{uuid}.{ext}` for assets, `logos/{sellerId}/{uuid}.{ext}` for logos.
- Validate file type and size both client-side and server-side.

---

## Adding a New Route

1. Choose the right client from the matrix above.
2. Use the repository factory for reads.
3. Apply input validation with Zod (`apps/web/src/lib/api/validation.ts`).
4. Return safe error responses (`apps/web/src/lib/api/errors.ts`).
5. If you believe service role is required, add the file to the exceptions table above and to the branch test.
