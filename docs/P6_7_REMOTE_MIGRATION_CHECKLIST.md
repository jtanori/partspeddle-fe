# P6.7 — Remote Migration Application Checklist

Use this checklist when applying the P6 remediation migration stack to the live staging and production Supabase projects.

## Environment setup

Source the stage-specific `.env` file and map the variables operational scripts expect:

```bash
# Staging
set -a && source .env.staging && set +a
export STAGING_SUPABASE_PROJECT_ID=$SUPABASE_PROJECT_REF
export SUPABASE_ACCESS_TOKEN=$SUPABASE_PAT

# Production
set -a && source .env.production && set +a
export PRODUCTION_SUPABASE_PROJECT_ID=$SUPABASE_PROJECT_REF
export SUPABASE_ACCESS_TOKEN=$SUPABASE_PAT
```

See `docs/OPERATIONS_ENV_MAPPING.md` for the full mapping.

## Prerequisites

- [ ] P4.4 local migration replay parity validated.
- [ ] P4.5 CI/CD deploy path proven.
- [ ] P6.1–P6.6 migration files are merged into `develop`.
- [ ] `docs/DEPLOYMENT_RUNBOOK.md` documents the chosen migration strategy.
- [ ] Operator has Supabase Dashboard access and the `SUPABASE_ACCESS_TOKEN` CI secret.
- [ ] Docker/OrbStack is running (required for `supabase db diff --linked` shadow database).

## Pre-flight checks

- [ ] Run the remote drift check script:

  ```bash
  pnpm db:verify:remote-drift
  ```

  Expected: exit 0, no drift.

  **Troubleshooting:** if it fails with `Bind for 0.0.0.0:54320 failed: port is already allocated`, clean up the leftover shadow database container and retry:

  ```bash
  docker ps -aq --filter publish=54320 | xargs -r docker rm -f
  pnpm db:verify:remote-drift
  ```

- [ ] Confirm the migration stack order:
  1. `supabase/migrations/20260704000000_rebaseline_public_schema.sql`
  2. `supabase/migrations/20260709210000_p5_7_rls_alignment.sql`
  3. `supabase/migrations/20260710000000_tighten_rls_policies.sql`
  4. `supabase/migrations/20260711000000_restrict_grants.sql`
  5. `supabase/migrations/20260712000000_drop_unused_extensions.sql`

## Staging application

- [ ] Back up staging schema and data:
  ```bash
  pnpm db:backup:staging
  ```
  Artifacts land in `backups/` with timestamps.
- [ ] Link the staging project:
  ```bash
  supabase link --project-ref $STAGING_SUPABASE_PROJECT_ID
  ```
- [ ] Dry-run the migration push (preview without applying):
  ```bash
  pnpm db:dry-run:staging
  # Equivalent raw command:
  # supabase db push --dry-run
  ```
  Because the project transitioned from remote-first to migration-driven, the CLI may request `--include-all`. That is expected.
- [ ] Apply the migrations:
  ```bash
  supabase db push --include-all --yes
  ```
- [ ] Redeploy Edge Functions so the latest code is active:
  ```bash
  supabase functions deploy --use-api --project-ref $STAGING_SUPABASE_PROJECT_ID
  ```
- [ ] Verify the legacy triggers are gone:
  ```bash
  supabase db query --linked \
    "SELECT COUNT(*) AS legacy_trigger_count FROM information_schema.triggers WHERE trigger_name IN ('sync-algolia-webhook', 'notify-new-message');"
  ```
  Expected: `0`.
- [ ] Smoke-test replacement paths:
  ```bash
  pnpm ci:smoke:staging
  ```
  Expected: all checks PASS.

## Rotate the exposed service-role JWT (staging)

- [ ] In Supabase Dashboard → Project Settings → API → JWT Settings, rotate the JWT secret.
- [ ] Update Fly.io staging secrets:
  ```bash
  flyctl secrets set SUPABASE_SERVICE_ROLE_KEY=<new> SUPABASE_ANON_KEY=<new-anon> -a vintrack-stage
  ```
- [ ] Update GitHub Actions staging environment secrets:
  - `STAGING_SUPABASE_SERVICE_ROLE_KEY`
  - `STAGING_SUPABASE_ANON_KEY`
- [ ] Update repository-level GitHub Actions secrets (used by Supabase CLI / other jobs):
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `SUPABASE_ANON_KEY`
- [ ] Redeploy Edge Functions so they pick up the new `SUPABASE_SERVICE_ROLE_KEY`.
- [ ] Restart the Fly.io staging app (rolling deploy happens automatically after `flyctl secrets set`).
- [ ] Run health check and smoke tests again:
  ```bash
  curl https://stage.partspeddle.com/api/health
  pnpm ci:smoke:staging
  ```

## Production application

Repeat the staging sequence during a scheduled maintenance window.

- [ ] Back up production:
  ```bash
  pnpm db:backup:production
  ```
  Also take a Supabase Dashboard snapshot if available.
- [ ] Link the production project:
  ```bash
  supabase link --project-ref $PRODUCTION_SUPABASE_PROJECT_ID
  ```
- [ ] Dry-run:
  ```bash
  pnpm db:dry-run:production
  # Equivalent raw command:
  # supabase db push --dry-run
  ```
- [ ] Apply migrations:
  ```bash
  supabase db push --include-all --yes
  ```
- [ ] Redeploy Edge Functions:
  ```bash
  supabase functions deploy --use-api --project-ref $PRODUCTION_SUPABASE_PROJECT_ID
  ```
- [ ] Verify legacy triggers are gone:
  ```bash
  supabase db query --linked \
    "SELECT COUNT(*) AS legacy_trigger_count FROM information_schema.triggers WHERE trigger_name IN ('sync-algolia-webhook', 'notify-new-message');"
  ```
  Expected: `0`.
- [ ] Smoke-test replacement paths.

## Rotate the exposed service-role JWT (production)

- [ ] In Supabase Dashboard → Project Settings → API → JWT Settings, rotate the JWT secret.
- [ ] Update Fly.io production secrets:
  ```bash
  flyctl secrets set SUPABASE_SERVICE_ROLE_KEY=<new> SUPABASE_ANON_KEY=<new-anon> -a vintrack-prod
  ```
- [ ] Update GitHub Actions production environment secrets:
  - `PRODUCTION_SUPABASE_SERVICE_ROLE_KEY`
  - `PRODUCTION_SUPABASE_ANON_KEY`
- [ ] Update repository-level GitHub Actions secrets:
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `SUPABASE_ANON_KEY`
- [ ] Redeploy Edge Functions.
- [ ] Restart the Fly.io production app.
- [ ] Run production health check and smoke tests:
  ```bash
  curl https://www.partspeddle.com/api/health
  ```

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
