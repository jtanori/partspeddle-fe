# P6.1 — Tighten Overly Permissive RLS Policies

**Branch:** `feat/p6-1-tighten-rls-policies`  
**Base:** `develop`  
**Goal:** Fix the permissive RLS policies identified in the P4.6 database security audit so that public and user-scoped reads expose only appropriate rows.

---

## Current State

The rebaseline migration (`supabase/migrations/20260704000000_rebaseline_public_schema.sql`) contains the following policy issues:

1. **`part_images` public read policy** is unconditional (`FOR SELECT USING (true)`), so it leaks images linked to draft/removed/sold parts.
2. **`fraud_events`** and **`risk_scores`** have `FOR SELECT USING (auth.uid() = user_id)` policies, exposing internal risk/fraud signals to the subject user.
3. **`offers` insert policy** only checks `auth.uid() = buyer_id`; it does not validate that the referenced `part_id` exists, is available, or belongs to the `seller_id`.
4. **`conversations` insert policy** only checks `auth.uid() = buyer_id`; it does not validate `part_id`/`seller_id`.
5. **`seller_owns_profile`** on `seller_profiles` uses `USING` without `FOR SELECT/UPDATE`, making it an implicit `FOR ALL` policy that also allows deletion.

---

## Required Changes

All changes should be delivered as a new migration file so they can be applied to remote projects through the migration workflow (see P6.7).

### 1. Tighten `part_images` public read

Replace the unconditional policy with one that joins to `parts` and only returns images linked to parts with `status = 'AVAILABLE'`:

```sql
DROP POLICY IF EXISTS "Public read access" ON "public"."part_images";
CREATE POLICY "Public read access for available parts"
  ON "public"."part_images"
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM "public"."parts" p
      WHERE p.id = part_images.part_id
        AND p.status = 'AVAILABLE'
    )
  );
```

### 2. Remove user-facing fraud/risk policies

`fraud_events` and `risk_scores` are internal operational tables. They should be readable only by `service_role` (and optionally a dedicated admin role). Remove the subject-user policies:

```sql
DROP POLICY IF EXISTS "Users can view their own fraud events" ON "public"."fraud_events";
DROP POLICY IF EXISTS "Users can view their own risk scores" ON "public"."risk_scores";
```

If an admin dashboard needs to read these tables, add an explicit admin policy after P5.2/P5.7.

### 3. Strengthen `offers` insert policy

Add checks that:

- `buyer_id = auth.uid()`.
- The referenced `part_id` exists and `status = 'AVAILABLE'`.
- The referenced `seller_id` matches the part's `seller_id`.

Example:

```sql
DROP POLICY IF EXISTS "Buyers can create offers" ON "public"."offers";
CREATE POLICY "Buyers can create offers for available parts"
  ON "public"."offers"
  FOR INSERT
  WITH CHECK (
    buyer_id = auth.uid()
    AND seller_id = (
      SELECT seller_id FROM "public"."parts" WHERE id = part_id AND status = 'AVAILABLE'
    )
  );
```

### 4. Strengthen `conversations` insert policy

Ensure a conversation can only be started about an existing, available part and that `seller_id` matches the part's seller:

```sql
DROP POLICY IF EXISTS "Users can insert conversations" ON "public"."conversations";
CREATE POLICY "Buyers can start conversations about available parts"
  ON "public"."conversations"
  FOR INSERT
  WITH CHECK (
    buyer_id = auth.uid()
    AND part_id IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM "public"."parts" p
      WHERE p.id = part_id
        AND p.status = 'AVAILABLE'
        AND p.seller_id = seller_id
    )
  );
```

### 5. Restrict `seller_owns_profile` to SELECT/UPDATE

```sql
DROP POLICY IF EXISTS "seller_owns_profile" ON "public"."seller_profiles";
CREATE POLICY "seller_owns_profile_select"
  ON "public"."seller_profiles"
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "seller_owns_profile_update"
  ON "public"."seller_profiles"
  FOR UPDATE
  USING (user_id = auth.uid());
```

---

## Work Items

1. Create `supabase/migrations/20260710000000_tighten_rls_policies.sql` (use current date).
2. Apply the five policy changes above.
3. Run `supabase db reset --yes` locally and confirm the migration applies cleanly.
4. Add/update branch tests under `tests/branch/p6-1-tighten-rls-policies/`:
   - Anon cannot read `part_images` linked to a non-AVAILABLE part.
   - User cannot read their own `fraud_events`/`risk_scores` via anon/authenticated client.
   - Buyer cannot create an offer for a non-available part or with mismatched seller.
   - Seller profile cannot be deleted via the authenticated client.
5. Update `docs/PRC.md` Section 6/11 evidence links.
6. Update `docs/RLS_POLICY_MAP.md` (from P5.7) with the new policies.

---

## Acceptance Criteria

- [ ] New migration file exists and applies cleanly with `supabase db reset`.
- [ ] `part_images` public read is restricted to images of `AVAILABLE` parts.
- [ ] `fraud_events` and `risk_scores` are no longer readable by `authenticated` users.
- [ ] `offers` insert validates part availability and seller match.
- [ ] `conversations` insert validates part availability and seller match.
- [ ] `seller_profiles` policy allows only SELECT/UPDATE for the owning seller.
- [ ] Branch tests verify each policy change.
- [ ] `pnpm test` and `supabase db reset` succeed.

---

## Dependencies

- **Blocked by:** P4.6 (DB audit findings), P5.7 (RLS alignment planning).
- **Unblocks:** P5.4 (repository layer can safely use anon/RLS), P5.8 (security certification).

---

## Risks

- Tightening `part_images` public read may hide images on the PDP if the part status check is wrong; test with seeded data.
- Removing fraud/risk policies without an admin replacement may break internal dashboards; verify no app code reads these tables via authenticated client.
- `offers`/`conversations` insert validation uses a subquery; ensure performance is acceptable with indexes on `parts(id, status, seller_id)`.
