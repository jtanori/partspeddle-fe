# P6.4 — Replace Service-Role Usage in Public and Analytics Routes

**Branch:** `feat/p6-4-replace-service-role-public-routes`  
**Base:** `develop`  
**Goal:** Remove `supabaseAdmin` from public read routes and analytics write routes so they use anon/RLS or authenticated clients.

---

## Current State

The following routes/pages import `supabaseAdmin` for reads/writes that should not require service role:

- `src/app/(public)/page.tsx` — featured/recent parts, featured sellers.
- `src/app/(public)/listing/[id]/page.tsx` — part + seller profile.
- `src/app/api/parts/featured/route.ts`
- `src/app/api/sellers/top/route.ts`
- `src/app/api/taxonomy/route.ts`
- `src/app/api/search/clicks/route.ts`
- `src/app/api/search/events/route.ts`

This is a subset of the broader P5.4 repository refactor. P6.4 focuses specifically on the public/analytics surface identified in the P4.6 audit.

---

## Required Changes

### 1. Introduce anon-key server client helper

Create or use `src/lib/supabase-server.ts`:

```ts
export function createAnonServerClient() {
  return createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!, {
    auth: { persistSession: false },
  });
}
```

This client respects RLS and is appropriate for public reads and anonymous analytics writes.

### 2. Migrate public pages

- `src/app/(public)/page.tsx`
  - Replace `supabaseAdmin` with `createAnonServerClient()`.
  - Rely on RLS to filter `parts.status = 'AVAILABLE'`; remove the manual `.eq('status', 'AVAILABLE')` if RLS handles it.
- `src/app/(public)/listing/[id]/page.tsx`
  - Replace `supabaseAdmin` with `createAnonServerClient()`.
  - If the PDP needs seller-only fields, ensure the seller profile policy exposes those fields to anon/public reads.

### 3. Migrate public API routes

- `/api/parts/featured` → anon client + `SELECT` on `parts` with RLS.
- `/api/sellers/top` → anon client + `SELECT` on `seller_profiles` with public-read policy.
- `/api/taxonomy` → anon client + `SELECT` on taxonomy tables.

### 4. Migrate analytics write routes

- `/api/search/clicks` and `/api/search/events` currently insert client-controlled IDs using `supabaseAdmin`.
- Options:
  - Use anon client and an RLS policy that allows anonymous inserts into `search_click_events`/`search_events` (rate-limited).
  - Or validate/authenticate the request server-side and use the authenticated user ID instead of a client-provided ID.
- Remove any `user_id` or `session_id` fields sent directly from the client; derive or validate them server-side.

### 5. Add branch tests

Under `tests/branch/p6-4-replace-service-role-public-routes/`:

- Assert no `supabaseAdmin` import remains in the migrated files.
- Public pages return 200 and data using the anon client.
- Analytics routes accept valid payloads and reject malformed/oversized payloads.
- Tenant isolation: anon user cannot read non-public data.

---

## Work Items

1. Create `src/lib/supabase-server.ts` if it does not already exist (coordinate with P5.4).
2. Migrate the six files listed above.
3. Update or add RLS policies to support anon reads/writes where needed (coordinate with P6.1).
4. Add branch tests.
5. Update `docs/DATA_ACCESS.md` and `docs/RLS_POLICY_MAP.md`.

---

## Acceptance Criteria

- [ ] `supabaseAdmin` is removed from `src/app/(public)/page.tsx` and `src/app/(public)/listing/[id]/page.tsx`.
- [ ] `supabaseAdmin` is removed from `/api/parts/featured`, `/api/sellers/top`, `/api/taxonomy`, `/api/search/clicks`, and `/api/search/events`.
- [ ] Public reads use the anon-key server client and RLS.
- [ ] Analytics writes no longer accept raw client-controlled IDs.
- [ ] Branch tests verify the migration and tenant isolation.
- [ ] `pnpm test`, `pnpm lint`, and `pnpm typecheck` pass.

---

## Dependencies

- **Blocked by:** P5.2 (cookie-session auth stable), P5.4 (repository/server-client pattern), P6.1 (RLS policies support anon reads).
- **Unblocks:** P5.8 (security certification).

---

## Risks

- RLS policies must be correct before removing service role; otherwise public data may disappear.
- Analytics routes may lose events if anon inserts are blocked by policy or rate limiting; test event volume.
- This work overlaps P5.4; coordinate to avoid duplicate refactors.
