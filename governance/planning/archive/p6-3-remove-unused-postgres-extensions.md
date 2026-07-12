# P6.3 — Remove Unused Postgres Extensions

**Branch:** `feat/p6-3-remove-unused-extensions`  
**Base:** `develop`  
**Goal:** Reduce attack surface by dropping Postgres extensions that are installed but not used by the marketplace core.

---

## Current State

`supabase/migrations/20260704000000_rebaseline_public_schema.sql` installs these extensions:

- `pg_net`
- `pg_graphql`
- `pg_stat_statements`
- `pgcrypto`
- `supabase_vault`
- `uuid-ossp`

The marketplace core uses:

- `pgcrypto` for `gen_random_uuid()`.
- `pg_stat_statements` is generally useful and harmless; keep it.

The following extensions are not referenced anywhere in the codebase:

- `pg_net`
- `pg_graphql`
- `supabase_vault`
- `uuid-ossp` ( Supabase projects default to `gen_random_uuid()` from `pgcrypto`; `uuid-ossp` is not needed)

---

## Required Changes

### 1. Create a migration to drop unused extensions

Create `supabase/migrations/20260712000000_drop_unused_extensions.sql`:

```sql
DROP EXTENSION IF EXISTS "pg_net";
DROP EXTENSION IF EXISTS "pg_graphql";
DROP EXTENSION IF EXISTS "supabase_vault";
DROP EXTENSION IF EXISTS "uuid-ossp";
```

Also remove the corresponding `CREATE EXTENSION` lines from `supabase/SCHEMA.sql` so the baseline does not reinstall them.

### 2. Verify no dependencies

Before applying to staging/production, run:

```sql
SELECT
  d.objid::regclass::text AS object_name,
  d.classid::regclass AS object_type,
  e.extname AS extension
FROM pg_depend d
JOIN pg_extension e ON d.refobjid = e.oid
WHERE e.extname IN ('pg_net', 'pg_graphql', 'supabase_vault', 'uuid-ossp');
```

Expected result: zero rows.

### 3. Handle Supabase-managed extensions

Some Supabase extensions may be auto-installed or required by the platform. If a `DROP EXTENSION` fails because the platform re-creates it, document the exception in `docs/DEPLOYMENT_RUNBOOK.md` and leave it enabled.

---

## Work Items

1. Create the migration file with `DROP EXTENSION` statements.
2. Remove the matching `CREATE EXTENSION` lines from `supabase/SCHEMA.sql`.
3. Run `supabase db reset --yes` locally and confirm the migration applies cleanly.
4. Run the dependency check query above and record the result.
5. Add/update branch tests under `tests/branch/p6-3-remove-unused-extensions/`:
   - Assert the four extensions are not present after migration.
   - Assert `gen_random_uuid()` still works via `pgcrypto`.
6. Update `docs/PRC.md` Section 6/11 evidence.

---

## Acceptance Criteria

- [ ] New migration drops `pg_net`, `pg_graphql`, `supabase_vault`, and `uuid-ossp`.
- [ ] `supabase/SCHEMA.sql` no longer creates those extensions.
- [ ] Dependency check confirms no database objects depend on the removed extensions.
- [ ] Branch tests confirm the extensions are absent and `pgcrypto` UUID generation still works.
- [ ] `supabase db reset` and `pnpm test` succeed.

---

## Dependencies

- **Blocked by:** P4.6 (DB audit).
- **Unblocks:** P5.8 (security certification), P6.7 (remote migration).

---

## Risks

- Dropping a platform-managed extension may cause Supabase to recreate it automatically or throw an error. Test in staging first and document exceptions.
- If any hidden dependency exists (e.g., an extension-provided operator used in an index), `DROP EXTENSION` will fail with a dependency error. The dependency check query above will catch this before production.
