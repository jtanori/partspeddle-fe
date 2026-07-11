# P6.7 — Remote Migration Application Checklist

Use this checklist when applying the P6 remediation migration stack to the live staging and production Supabase projects.

## Prerequisites

- [ ] P4.4 local migration replay parity validated.
- [ ] P4.5 CI/CD deploy path proven.
- [ ] P6.1–P6.6 migration files are merged into `develop`.
- [ ] `docs/DEPLOYMENT_RUNBOOK.md` documents the chosen migration strategy.
- [ ] Operator has Supabase Dashboard access and the `SUPABASE_ACCESS_TOKEN` CI secret.

## Pre-flight checks

- [ ] Run the remote drift check script:
  ```bash
  pnpm db:verify:remote-drift
  ```
  Expected: exit 0, no drift.
- [ ] Confirm the migration stack order:
  1. `supabase/migrations/20260704000000_rebaseline_public_schema.sql`
  2. `supabase/migrations/20260710000000_tighten_rls_policies.sql`
  3. `supabase/migrations/20260711000000_restrict_grants.sql`
  4. `supabase/migrations/20260712000000_drop_unused_extensions.sql`

## Staging application

- [ ] Back up staging schema and data:
  ```bash
  supabase db dump --db-name postgres --schema-only -f backups/staging_schema_$(date +%Y%m%d).sql
  supabase db dump --db-name postgres --data-only -f backups/staging_data_$(date +%Y%m%d).sql
  ```
- [ ] Link the staging project:
  ```bash
  supabase link --project-ref $STAGING_SUPABASE_PROJECT_ID
  ```
- [ ] Dry-run the migration push (preview without applying):
  ```bash
  pnpm db:dry-run:staging
  ```
  This links to staging, runs `supabase db push --dry-run`, prints the migrations that would be applied, and restores the previous linked project.
- [ ] Apply the migrations:
  ```bash
  supabase db push --yes
  ```
- [ ] Verify the legacy triggers are gone:
  ```sql
  SELECT trigger_name, event_object_table
  FROM information_schema.triggers
  WHERE trigger_name IN ('sync-algolia-webhook', 'notify-new-message');
  ```
  Expected: zero rows.
- [ ] Smoke-test replacement paths:
  - Insert/update a part and confirm a `search_outbox` row is created.
  - Run `pnpm search:process-outbox` and confirm Algolia receives the update.
  - Confirm `notify-new-message` no longer fires and the app invokes `send-message-notification` explicitly.

## Rotate the exposed service-role JWT

- [ ] In Supabase Dashboard → Project Settings → API → JWT Settings, rotate the JWT secret.
- [ ] Update `SUPABASE_SERVICE_ROLE_KEY` and `SUPABASE_ANON_KEY` in Fly.io staging secrets.
- [ ] Update `SUPABASE_SERVICE_ROLE_KEY` and `SUPABASE_ANON_KEY` in GitHub Actions staging environment secrets.
- [ ] Redeploy Edge Functions so they pick up the new `SUPABASE_SERVICE_ROLE_KEY`.
- [ ] Restart the Fly.io staging app.
- [ ] Run `GET https://stage.partspeddle.com/api/health` and smoke tests.

## Production application

Repeat the staging steps above in production during a scheduled maintenance window:

- [ ] Back up production (dashboard snapshot + `supabase db dump` if possible).
- [ ] Link the production project and run `supabase db push --dry-run`.
- [ ] Apply migrations with `supabase db push --yes`.
- [ ] Verify legacy triggers are gone.
- [ ] Smoke-test replacement paths.
- [ ] Rotate the service-role JWT and update Fly.io + GitHub production secrets.
- [ ] Redeploy Edge Functions and restart the Fly.io production app.
- [ ] Run production health check and smoke tests.

## Lock in the migration workflow

- [ ] Update CI to fail `supabase db push` if `pnpm db:verify:remote-drift` reports drift.
- [ ] Document that all future DB changes must come through `supabase/migrations/`.
- [ ] Link this checklist and the drift report in `docs/PRC.md` Section 11 evidence.

## Rollback

If the migration push fails:

1. Do not rotate the JWT until the migration is confirmed successful.
2. Restore from the pre-migration backup or apply a compensating migration.
3. Re-run `pnpm db:verify:remote-drift` to confirm parity before retrying.

## Evidence artifacts

Record and link:

- Pre-migration remote drift report (`reports/remote-drift-report.md` or CI output).
- Staging and production `supabase db push` CI run URLs.
- JWT rotation timestamp and secret-update confirmations.
- Post-migration smoke-test results.
