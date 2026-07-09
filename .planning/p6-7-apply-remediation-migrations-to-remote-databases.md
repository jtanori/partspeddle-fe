# P6.7 — Apply Remediation Migrations to Remote-First Databases

**Branch:** `feat/p6-7-apply-remote-migrations` (operations branch; no app code changes)  
**Base:** `develop`  
**Goal:** Safely transition the live staging and production Supabase projects from a remote-first workflow to a migration-driven workflow, applying the P6 remediation stack and rotating the exposed service-role JWT.

---

## Current State

- The project previously followed a **remote-first** workflow: schema changes were applied directly in the Supabase dashboard or via ad-hoc scripts.
- The repo now contains a migration-driven baseline:
  - `supabase/migrations/20260704000000_rebaseline_public_schema.sql`
  - Follow-up migrations for P6.1–P6.3 (tighten RLS, restrict grants, drop extensions).
- These migrations have **not yet been applied** to the live staging or production projects.
- P6.6 removed the legacy triggers in code, but the actual service-role JWT rotation on the remote projects is pending this work.

---

## Prerequisites

Before touching any remote project:

- [ ] P4.4 local migration replay parity validated.
- [ ] P4.5 CI/CD deploy path proven.
- [ ] P6.1–P6.3 migration files merged into `develop`.
- [ ] `docs/DEPLOYMENT_RUNBOOK.md` updated with the chosen migration strategy.

---

## Migration Strategy

Recommended approach for staging: **Option A — `supabase db push`** after confirming remote drift is minimal.

Recommended approach for production: **Option B — Manual ordered apply** unless staging proves `db push` is safe, in which case use the same.

### Option A — `supabase db push` (preferred if remote is clean)

1. Link the project:
   ```bash
   supabase link --project-ref <PROJECT_REF>
   ```
2. Dry-run:
   ```bash
   supabase db push --dry-run
   ```
3. Apply:
   ```bash
   supabase db push --yes
   ```

### Option B — Manual ordered apply

1. Run migration SQL files via `psql` or Supabase SQL Editor in order.
2. Mark them as applied in `supabase_migrations.schema_migrations`:
   ```sql
   INSERT INTO supabase_migrations.schema_migrations (version, name, statements, status)
   VALUES ('20260704000000', 'rebaseline_public_schema', '{}', 'applied');
   ```

### Option C — `supabase db reset` on staging only

Acceptable if data loss in staging is acceptable. Restore seed data afterward with `pnpm db:seed:staging`.

---

## Work Items

### 1. Back up each environment

- Staging:
  ```bash
  supabase db dump --db-name postgres --schema-only -f backups/staging_schema_$(date +%Y%m%d).sql
  supabase db dump --db-name postgres --data-only -f backups/staging_data_$(date +%Y%m%d).sql
  ```
- Production:
  - Use Supabase Dashboard snapshot if available.
  - Also run `supabase db dump` if network/permissions allow.

### 2. Validate remote vs. migration parity

1. Dump the remote schema before applying migrations.
2. Diff against `supabase/baseline/remote_20260707_public.sql` plus repo migrations.
3. Resolve drift caused by ad-hoc remote changes (extra indexes, columns, triggers, functions).
4. Record the final drift report in `reports/`.

### 3. Apply the migration stack to staging

Apply at minimum:

- `supabase/migrations/20260704000000_rebaseline_public_schema.sql`
- `supabase/migrations/20260710000000_tighten_rls_policies.sql` (P6.1)
- `supabase/migrations/20260711000000_restrict_grants.sql` (P6.2)
- `supabase/migrations/20260712000000_drop_unused_extensions.sql` (P6.3)

### 4. Verify the legacy triggers are gone

```sql
SELECT trigger_name, event_object_table
FROM information_schema.triggers
WHERE trigger_name IN ('sync-algolia-webhook', 'notify-new-message');
```

Expected: zero rows.

### 5. Smoke-test replacement paths

- **Algolia sync:** insert/update a part, confirm a `search_outbox` row is created, then run `pnpm search:process-outbox` and confirm Algolia receives the update.
- **Message notifications:** confirm the `notify-new-message` trigger no longer fires and that the application invokes `send-message-notification` explicitly (or document that notifications are currently a logging stub).

### 6. Rotate the Supabase service-role JWT

1. In Supabase Dashboard → Project Settings → API → Rotate JWT secret.
2. Update `SUPABASE_SERVICE_ROLE_KEY` in Fly.io staging/production secrets.
3. Update `SUPABASE_SERVICE_ROLE_KEY` in GitHub Actions secrets.
4. Redeploy the Fly.io apps and Edge Functions so they pick up the new key.

### 7. Apply to production

Repeat steps 1–6 in production during a scheduled maintenance window.

### 8. Lock in the migration workflow

- Update CI to fail `supabase db push` if remote drift is detected.
- Document that all future DB changes must come through `supabase/migrations/`.
- Add a pre-deploy check script `scripts/db/verify-remote-drift.ts`.

---

## Acceptance Criteria

- [ ] Staging migration stack applied successfully and smoke tests pass.
- [ ] Production migration stack applied successfully and smoke tests pass.
- [ ] Legacy triggers are absent in both environments.
- [ ] Service-role JWT rotated in both environments and all consumers updated.
- [ ] Remote drift check script exists and runs in CI.
- [ ] `docs/DEPLOYMENT_RUNBOOK.md` documents the migration strategy and rollback steps.
- [ ] Evidence artifacts (drift reports, CI run URLs, rotation timestamps) are linked in `docs/PRC.md`.

---

## Dependencies

- **Blocked by:** P4.4, P4.5, P6.1, P6.2, P6.3, P6.5, P6.6.
- **Unblocks:** P5.8 (final security certification), final `develop → main` merge.

---

## Risks

- Remote-first drift may be larger than expected, requiring manual reconciliation before `db push` can succeed.
- Production migration should be done during a maintenance window with a rollback plan.
- JWT rotation will invalidate all active service-role clients until Fly/Edge secrets are updated; coordinate the order of operations carefully.
