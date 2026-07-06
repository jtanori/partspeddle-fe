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

# 4. Database Deployment Procedure

1. **Schema Change**: Perform via Supabase Dashboard SQL Editor.
2. **Sync**: Create new migration file: `supabase/migrations/<timestamp>_description.sql`.
3. **Commit**: `git add supabase/migrations/ && git commit`.
4. **Verification**: CI job `npm run verify:schema` ensures DB parity with migration files.

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
   ```

3. **Verify Configuration**:
   Verify that secrets are correctly listed for the environment:
   ```bash
   gh api /repos/jtanori/partspeddle-fe/environments/production/secrets
   ```
