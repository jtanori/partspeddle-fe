# VinTrack Search Platform – Fly.io Deployment & Operations Runbook

## Document Information

| Field   | Value                    |
| :------ | :----------------------- |
| System  | VinTrack Search Platform |
| Version | 1.0                      |
| Owner   | Engineering              |
| Status  | Active                   |

---

# 1. Environment Strategy

- **Staging (`vintrack-stage`)**: `https://stage.partspeddle.com` — mirrors production schema; used for validation of migrations, operational suites, and load testing.
- **Production (`vintrack-prod`)**: `https://partspeddle.com` — customer-facing environment.

# 2. Deployment Pipeline

## Staging Deployment

1. `git push` to `develop`.
2. CI `ci.yml` runs tests/lint.
3. Fly.io deployment is triggered automatically using `fly/fly.stage.toml`.
4. **Post-Deployment**: Run validation suite (see Operational Validation below).

### Local fallback

```bash
pnpm deploy:staging
# or
bash scripts/ops/deploy.sh staging
```

## Production Deployment

1. Merge validated code to `main`.
2. CI `ci.yml` runs tests/lint.
3. Fly.io deployment is triggered automatically using `fly/fly.prod.toml`.

### Local fallback

```bash
pnpm deploy:production
# or
bash scripts/ops/deploy.sh production
```

---

# 3. Local Supabase development

Prerequisites:

- Docker Desktop (or any `docker` daemon) is running.
- The Supabase CLI is installed (`supabase --version`).

## Start the local stack

`pnpm db:local:up` starts only the services needed to run the local Postgres
and Edge Functions. Auth is handled by the remote Supabase project, so the local
`gotrue` container is intentionally omitted:

- Started: `postgres`, `postgrest`, `edge-runtime`, `kong`.
- Excluded: `gotrue`, `realtime`, `storage-api`, `imgproxy`, `mailpit`, `postgres-meta`, `studio`, `logflare`, `vector`, `supavisor`.

```bash
pnpm db:local:up
pnpm db:local:status
```

`supabase status` prints the local `anon` and `service_role` keys. Copy them
into the root `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon key from status>
SUPABASE_URL=http://localhost:54321
SUPABASE_SERVICE_ROLE_KEY=<service_role key from status>
```

Edge Function secrets are loaded from `supabase/.env.local`:

```bash
cp supabase/.env.example supabase/.env.local
# Fill in real values for ALGOLIA_APP_ID, ALGOLIA_ADMIN_KEY,
# SUPABASE_WEBHOOK_SECRET, and GEMINI_API_KEY.
```

## Serve functions locally

```bash
supabase functions serve
```

## Reset and seed the local database

```bash
pnpm db:local:reset
pnpm db:local:seed
```

## Stop the local stack

```bash
pnpm db:local:down
```

---

# 4. Supabase CI/CD

Migrations and Edge Functions are deployed automatically by `.github/workflows/ci.yml`.

## Triggers

- **Push to `develop`**: deploys to the staging Supabase project.
- **Push to `main`**: deploys to the production Supabase project.
- **Manual dispatch**: from the GitHub Actions tab, choose a branch and set `dry-run`.

## Required secrets

Configure these in the GitHub repository settings (and the `staging` / `production` environments if you prefer environment-scoped secrets):

- `SUPABASE_ACCESS_TOKEN` — personal access token (`sbp_...`) for the Supabase CLI.
- `STAGING_SUPABASE_PROJECT_ID` — staging project reference (`zvv...`).
- `PRODUCTION_SUPABASE_PROJECT_ID` — production project reference (`zvv...`).

## What the workflow does

For each environment:

1. Installs the Supabase CLI (`supabase/setup-cli`).
2. Logs in with `SUPABASE_ACCESS_TOKEN`.
3. Links the target project.
4. Runs `supabase db push` to apply pending migrations.
5. Runs `supabase functions deploy --use-api` to deploy Edge Functions.

The Supabase deploy jobs depend on the `test` job, so they only run if tests, lint, and typecheck pass.

## Dry-run

To preview what would be deployed without applying changes:

```bash
# Local
pnpm db:deploy:dry-run

# CI (manual)
# Go to Actions → VinTrack CI → Run workflow → select branch → check "dry-run"
```

In dry-run mode the workflow runs `supabase db push --dry-run` and skips Edge Function deployment.

## Rollback

- **Migrations**: create a compensating migration in `supabase/migrations/` that reverts the change, or restore from a Supabase backup and redeploy the previous commit.
- **Edge Functions**: revert the function code in git and push the previous commit, or redeploy manually with `supabase functions deploy <name>`.

---

# 5. End-to-end deploy verification

After a change lands on `develop`, the `smoke-staging` CI job runs automatically once both the Fly.io and Supabase staging deploys finish.

## What the smoke job checks

1. `GET https://stage.partspeddle.com/api/health` returns HTTP 200.
2. `scripts/search/process-search-outbox.ts` runs against staging and completes without errors.
3. `POST /functions/v1/send-message-notification` returns a non-5xx response (401 is expected for an unauthenticated request; any 5xx means the function is not deployed or unhealthy).

## Required staging secrets

- `STAGING_SUPABASE_URL`
- `STAGING_SUPABASE_ANON_KEY`
- `STAGING_SUPABASE_SERVICE_ROLE_KEY`

These values are aliased in `.env.staging` (e.g., `STAGING_SUPABASE_ANON_KEY=$SUPABASE_ANON_KEY`). Source the file to run smoke tests locally.

## Evidence template

When exercising the deploy path (e.g. for P4.5 certification), record:

```markdown
- Date: YYYY-MM-DD HH:MM UTC
- Commit/branch: `develop` @ <sha>
- CI run URL: <link to GitHub Actions run>
- Supabase deploy result: PASS / FAIL
- Fly.io deploy result: PASS / FAIL
- Smoke test result: PASS / FAIL
- Schema version (from `supabase migration list`): <version>
- Edge Function versions: <output of `supabase functions list`>
- Notes:
  - Any deviations, rollbacks, or follow-ups.
```

To run the smoke script locally against staging:

```bash
source .env.staging && pnpm ci:smoke:staging
```

Or export the variables manually:

```bash
STAGING_URL=https://stage.partspeddle.com \
STAGING_SUPABASE_URL=<url> \
STAGING_SUPABASE_ANON_KEY=<anon> \
STAGING_SUPABASE_SERVICE_ROLE_KEY=<service-role> \
pnpm ci:smoke:staging
```

---

# 6. Database Deployment Procedure

1. **Schema Change**: write a new migration file in `supabase/migrations/<timestamp>_description.sql`.
2. **Local verification**: `pnpm db:local:reset` and `pnpm db:validate:replay`.
3. **Commit**: `git add supabase/migrations/ && git commit`.
4. **Deploy**: merge to `develop` (staging) or `main` (production); the CI workflow runs `supabase db push`.

# 4. Operational Validation

Required commands for pre-deployment certification:

```bash
# Verify DB Schema vs Migration Files
npm run verify:schema

# Perform Outbox Durability/Recovery Validation
npm run test:outbox-recovery

# Perform Data Consistency (Drift) Audit
npm run test:drift

# Performance Baseline
npm run test:load
```

---

# 5. Deployment Checklist

## Staging

- [ ] Tests passing
- [ ] Migrations verified
- [ ] Secrets configured
- [ ] Health checks passing (`GET /api/health`)
- [ ] Operational Validation (Outbox/Drift/Load) passing

## Production

- [ ] Staging validated
- [ ] Approval received
- [ ] Backup verified
- [ ] Deployment executed
- [ ] Smoke tests passed
- [ ] Monitoring healthy

---

# 6. GitHub Environments & Secret Configuration

To isolate secrets between environments, we use GitHub Environments. The workflows target `environment: staging` and `environment: production` dynamically.

## Steps for Configuring Production Secrets

When configuring the **Production** environment, execute the following commands using the GitHub CLI (`gh`):

1. **Verify or Create the Production Environment**:

   ```bash
   gh api -X PUT /repos/jtanori/partspeddle-fe/environments/production
   ```

2. **Configure Production-Specific Secrets**:
   Set each secret under the `production` environment scope using the `--env` flag:

   ```bash
   gh secret set SUPABASE_URL --env production --body "<prod-supabase-url>"
   gh secret set SUPABASE_ANON_KEY --env production --body "<prod-anon-key>"
   gh secret set SUPABASE_SERVICE_ROLE_KEY --env production --body "<prod-service-role-key>"
   gh secret set ALGOLIA_APP_ID --env production --body "<prod-algolia-app-id>"
   gh secret set ALGOLIA_ADMIN_KEY --env production --body "<prod-algolia-admin-key>"
   gh secret set GEMINI_API_KEY --env production --body "<prod-gemini-api-key>"
   ```

3. **Verify Configuration**:
   Verify that secrets are correctly listed for the environment:
   ```bash
   gh api /repos/jtanori/partspeddle-fe/environments/production/secrets
   ```

## Fly.io Application Secrets

Fly.io apps do **not** read from GitHub Environments directly. The deployment workflow only supplies `FLY_API_TOKEN`; all runtime secrets must be set on each Fly.io app via `flyctl secrets`.

### Required secrets per app

Both `vintrack-stage` and `vintrack-prod` must have the following secrets:

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_SUPABASE_URL` (same value as `SUPABASE_URL`)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` (same value as `SUPABASE_ANON_KEY`)
- `ALGOLIA_APP_ID`
- `ALGOLIA_ADMIN_KEY`
- `GEMINI_API_KEY`
- `SUPABASE_WEBHOOK_SECRET`

### Setting secrets

```bash
# Staging
flyctl secrets set \
  SUPABASE_URL="<stage-url>" \
  SUPABASE_ANON_KEY="<stage-anon>" \
  SUPABASE_SERVICE_ROLE_KEY="<stage-service-role>" \
  NEXT_PUBLIC_SUPABASE_URL="<stage-url>" \
  NEXT_PUBLIC_SUPABASE_ANON_KEY="<stage-anon>" \
  ALGOLIA_APP_ID="<stage-app-id>" \
  ALGOLIA_ADMIN_KEY="<stage-admin-key>" \
  GEMINI_API_KEY="<stage-gemini-key>" \
  SUPABASE_WEBHOOK_SECRET="<stage-webhook-secret>" \
  --app vintrack-stage

# Production
flyctl secrets set \
  SUPABASE_URL="<prod-url>" \
  SUPABASE_ANON_KEY="<prod-anon>" \
  SUPABASE_SERVICE_ROLE_KEY="<prod-service-role>" \
  NEXT_PUBLIC_SUPABASE_URL="<prod-url>" \
  NEXT_PUBLIC_SUPABASE_ANON_KEY="<prod-anon>" \
  ALGOLIA_APP_ID="<prod-app-id>" \
  ALGOLIA_ADMIN_KEY="<prod-admin-key>" \
  GEMINI_API_KEY="<prod-gemini-key>" \
  SUPABASE_WEBHOOK_SECRET="<prod-webhook-secret>" \
  --app vintrack-prod
```

### Verify secrets

```bash
flyctl secrets list --app vintrack-stage
flyctl secrets list --app vintrack-prod
```

Compare the output against `.env.example` to ensure no required variables are missing.
