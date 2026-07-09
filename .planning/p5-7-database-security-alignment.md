# P5.7 — Database Security Alignment (Application ↔ Postgres)

**Branch:** `feat/p5-7-database-security-alignment`  
**Base:** `develop`  
**Goal:** Ensure RLS policies, RPCs, and Edge Functions match the application’s routing/RBAC model so that removing service-role access from the app layer is safe.

---

## Current State

- `supabase/SCHEMA.sql` and `supabase/migrations/20260704000000_rebaseline_public_schema.sql` contain RLS policies for most tables.
- The application layer currently uses `supabaseAdmin` (service role) for most reads/writes, so RLS policies are largely bypassed in production.
- P4.6 performed a full database security audit and identified follow-ups tracked in P6.1–P6.6.
- Edge Functions were hardened in P1.4; webhook signatures are verified.
- Key RPCs include `commit_inventory_package` and `publish_listing_draft`.

---

## Gaps

1. No documented mapping between repositories/routes and the RLS policies they depend on.
2. Public reads currently use service role; it is unclear which policies are correct for anon-key reads.
3. Seller-scoped tables may lack RLS policies that enforce `seller_id = auth.uid()`.
4. RPCs may run with overly broad privileges or lack argument validation.
5. Service-role exceptions are not centrally documented.
6. No automated tenant-isolation tests run against the database through anon/authenticated clients.

---

## Work Items

### 1. Create an RLS policy map

Create `docs/RLS_POLICY_MAP.md` that maps every repository/route to the policies it requires:

| Table                 | Operation            | Required policy                                   | Client             |
| --------------------- | -------------------- | ------------------------------------------------- | ------------------ |
| `parts`               | SELECT public        | Public read only `status = 'AVAILABLE'`           | anon               |
| `parts`               | SELECT seller scoped | `seller_id = auth.uid()`                          | authenticated      |
| `seller_profiles`     | SELECT public        | Public read only verified profiles                | anon               |
| `seller_profiles`     | UPDATE               | `user_id = auth.uid()`                            | authenticated      |
| `listing_drafts`      | SELECT/INSERT/UPDATE | `seller_id = auth.uid()`                          | authenticated      |
| `part_images`         | SELECT public        | Public read only images linked to available parts | anon               |
| `search_click_events` | INSERT               | Allow authenticated + anon with rate limit        | anon/authenticated |

### 2. Review and fix RLS policies

Using `supabase/migrations/20260704000000_rebaseline_public_schema.sql` and P4.6 findings:

- Ensure every table in the application path has RLS enabled.
- Add missing `seller_id = auth.uid()` policies for `listing_drafts`, `seller_profiles`, and seller-scoped reads on `parts`.
- Tighten `part_images` public read to exclude images linked to draft/removed/sold parts (per P6.1).
- Restrict `seller_owns_profile` from `FOR ALL` to `SELECT/UPDATE` only (per P6.1).
- Replace broad `GRANT ALL` to `anon`/`authenticated` with least-privilege grants (coordinate with P6.2).

### 3. Review RPCs

Audit each RPC used by the app:

- `commit_inventory_package(listing, assets, fitment)`
  - Confirm `SECURITY DEFINER` and explicit `search_path`.
  - Validate arguments (e.g., seller_id matches `auth.uid()`, required fields present).
  - Log action for audit.
- `publish_listing_draft(draft_id)`
  - Confirm ownership check before publishing.
  - Validate draft completeness/state.
- Any other RPCs in `supabase/migrations/**`.

### 4. Verify tenant isolation

Add branch tests under `tests/branch/p5-7-database-security-alignment/`:

- Create two test users and seller profiles.
- With seller A’s authenticated client:
  - Can read/write seller A’s drafts, inventory, and profile.
  - Cannot read seller B’s drafts or inventory.
- With anon client:
  - Can read public available parts and verified seller profiles.
  - Cannot read drafts, orders, conversations, or admin data.
- With buyer client:
  - Can read own conversations/offers.
  - Cannot read seller-scoped data.

### 5. Document service-role exceptions

In `docs/RLS_POLICY_MAP.md` (or `docs/DATA_ACCESS.md`), list operations that legitimately require service role:

- Health-check DB connectivity probe.
- Admin batch reindex (`/api/admin/search/reindex`).
- Background search index worker (`src/backend/modules/search/**`).
- Storage upload path validation when authenticated client cannot perform required operations.

For each exception, document the justification and the audit trail.

### 6. Edge Function verification

- Confirm every Edge Function verifies its webhook secret or auth token (completed in P1.4).
- Confirm Supabase clients inside Edge Functions use least-privilege keys (anon/service role only where necessary).
- Add a checklist note to `docs/RLS_POLICY_MAP.md`.

### 7. Add migration guard

- Add a branch test or script that diffs RLS policies in `supabase/SCHEMA.sql` against the migration file and fails on drift.
- Ensure new migrations include `ALTER TABLE ... ENABLE ROW LEVEL SECURITY;` and explicit policy grants.

---

## Acceptance Criteria

- [ ] `docs/RLS_POLICY_MAP.md` maps every repository/route to required RLS policies.
- [ ] RLS policies support anon public reads and authenticated seller-scoped reads/writes.
- [ ] RPCs use `SECURITY DEFINER` with argument validation and ownership checks.
- [ ] Tenant-isolation branch tests pass for buyer/seller/anon contexts.
- [ ] Service-role exceptions are documented with justifications.
- [ ] Edge Function auth/secret verification is confirmed and documented.
- [ ] No drift between `supabase/SCHEMA.sql` and migration policies.
- [ ] `pnpm test`, `pnpm lint`, and `pnpm typecheck` pass.

---

## Dependencies

- **Blocked by:** P4.6 (DB security audit), P5.4 (repositories and data-access paths).
- **Unblocks:** P5.8 (security certification), P6.1–P6.5 (RLS/grant/RPC follow-ups).

---

## Risks

- Changing RLS policies can silently hide data from the app if policies are misaligned. Test in staging with representative data before production.
- RPC argument validation may break existing clients that send unexpected shapes; coordinate with P5.3 API validation work.
- Least-privilege grants may remove permissions that background jobs rely on; verify each grant change against `scripts/**` and Edge Functions.
