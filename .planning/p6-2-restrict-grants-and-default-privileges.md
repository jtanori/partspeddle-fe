# P6.2 — Restrict Grants and Default Privileges

**Branch:** `feat/p6-2-restrict-grants`  
**Base:** `develop`  
**Goal:** Replace the broad `GRANT ALL` pattern with least-privilege grants and stop propagating excessive privileges to future objects.

---

## Current State

`supabase/migrations/20260704000000_rebaseline_public_schema.sql` (and `supabase/SCHEMA.sql`) grants `ALL` on every table and function to `anon`, `authenticated`, and `service_role`:

- `GRANT ALL ON TABLE ... TO "anon";`
- `GRANT ALL ON TABLE ... TO "authenticated";`
- `GRANT ALL ON FUNCTION ... TO "anon";`
- `ALTER DEFAULT PRIVILEGES ... GRANT ALL ON TABLES/FUNCTIONS/SEQUENCES TO "anon"/"authenticated";`

This gives anonymous and authenticated users far more privileges than needed (e.g., `DELETE` on `users`, `INSERT` on `audit_log`, execution of internal trigger functions).

---

## Required Changes

Deliver changes as a new migration file. The migration should be safe and reversible where possible.

### 1. Replace table grants with least-privilege grants

For each application table, grant only the operations actually used by each role:

| Role            | Typical privileges                                                                                   |
| --------------- | ---------------------------------------------------------------------------------------------------- |
| `anon`          | `SELECT` on public lookup tables; no write on user/seller data.                                      |
| `authenticated` | `SELECT/INSERT/UPDATE` on tables the user owns or participates in; `SELECT` on public lookup tables. |
| `service_role`  | Full access where justified.                                                                         |

Example:

```sql
-- Public lookup tables: anon + authenticated can read
GRANT SELECT ON "public"."categories" TO "anon", "authenticated";

-- User-owned tables
GRANT SELECT, INSERT, UPDATE ON "public"."seller_profiles" TO "authenticated";

-- Internal tables: only service role
GRANT SELECT, INSERT ON "public"."audit_log" TO "service_role";
```

Sensitive tables (`audit_log`, `fraud_events`, `risk_scores`, `transactions` internal fields) should receive no grants to `anon`/`authenticated`.

### 2. Remove function grants from `anon`/`authenticated` where not needed

Most trigger/INTERNAL functions should only be executable by `postgres` or `service_role`. Remove grants for functions such as:

- `cleanup_old_notifications()`
- `fn_audit_log_changes()`
- `fn_enqueue_search_event()`
- `handle_new_user()`
- `handle_part_sale_lock()`
- `refresh_seller_search_signals()`
- `validate_transaction_seller()`

If the app or Edge Functions call a function directly via RPC, document it and grant `EXECUTE` only to the required role.

### 3. Fix default privileges

Replace the current default privileges:

```sql
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public"
  REVOKE ALL ON TABLES FROM "anon", "authenticated";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public"
  REVOKE ALL ON FUNCTIONS FROM "anon", "authenticated";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public"
  REVOKE ALL ON SEQUENCES FROM "anon", "authenticated";
```

Then add back minimal defaults if appropriate, e.g.:

```sql
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public"
  GRANT SELECT ON TABLES TO "anon", "authenticated";
```

### 4. Preserve service_role access

`service_role` should retain the grants it needs for background workers, admin APIs, and Edge Functions. Document any exceptions.

---

## Work Items

1. Audit every table and function in `supabase/migrations/20260704000000_rebaseline_public_schema.sql` and classify the required privileges.
2. Create `supabase/migrations/20260711000000_restrict_grants.sql`:
   - Revoke existing excessive `GRANT ALL` statements.
   - Apply least-privilege grants per classification.
   - Revoke and reset default privileges.
3. Run `supabase db reset --yes` locally and fix any permission errors surfaced by branch tests.
4. Add/update branch tests under `tests/branch/p6-2-restrict-grants/`:
   - `authenticated` client cannot `DELETE` from `users`.
   - `authenticated` client cannot `INSERT` into `audit_log`.
   - `anon` client cannot `INSERT` into `seller_profiles`.
   - `authenticated` client can still `SELECT` public lookup tables.
5. Update `docs/PRC.md` Section 6/11 and `docs/RLS_POLICY_MAP.md` with the new grant model.

---

## Acceptance Criteria

- [ ] New migration file revokes excessive grants and applies least-privilege grants.
- [ ] Default privileges no longer propagate `ALL` to `anon`/`authenticated`.
- [ ] `service_role` retains required access.
- [ ] Branch tests confirm `anon`/`authenticated` cannot perform privileged operations.
- [ ] Branch tests confirm normal app operations still work.
- [ ] `supabase db reset` and `pnpm test` succeed.

---

## Dependencies

- **Blocked by:** P4.6 (DB audit), P6.1 (RLS policies tightened first to avoid access regressions).
- **Unblocks:** P5.4 (safe repository access), P5.7 (RLS alignment), P5.8 (security certification).

---

## Risks

- Revoking too much can break the app or background jobs; classify privileges carefully and test every repository path.
- Default privilege changes affect objects created by `postgres` in the future; ensure migrations create objects with explicit grants where needed.
- Some Supabase internal operations may expect certain grants; test thoroughly in staging before production.
