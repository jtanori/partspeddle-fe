# Delivery Infrastructure Audit

**Date:** 2026-07-11  
**Scope:** CI/CD pipeline, Husky/lint-staged, Docker build, environment variables, secrets inventory, deployment pipeline.  
**Status:** D0 complete — DC-4, DC-6, DC-6.5, DC-7, and DC-7.1 operationally certified. First `develop → main` production promotion completed successfully on 2026-07-11.

---

## 1. CI Workflow Graph

Workflow file: `.github/workflows/ci.yml`

### Triggers

| Event               | Branches                                   |
| ------------------- | ------------------------------------------ |
| `push`              | `main`, `develop`, `feat/**`, `ci-test/**` |
| `pull_request`      | `main`, `develop`                          |
| `workflow_dispatch` | any (with `dry-run` boolean input)         |

### Jobs

```
test
├── storybook (needs: test)
├── security (needs: test)
└── configure (runs on every push/PR to resolve delivery context)
    ├── deploy-fly (needs: [test, configure]; if: delivery branch + push)
    ├── deploy-supabase (needs: [test, configure]; if: delivery branch + push or workflow_dispatch)
    └── smoke-tests (needs: [configure, deploy-fly, deploy-supabase]; if: delivery branch + push)
```

The `configure` job resolves the branch/environment mapping from `platform/operations/delivery/branches.json` and is used by all delivery jobs.

The production path is identical but triggered by `push` to `main` and targets the `production` environment.

### Environments

| Job                          | Environment  |
| ---------------------------- | ------------ |
| `deploy-staging`             | `staging`    |
| `deploy-supabase-staging`    | `staging`    |
| `smoke-staging`              | `staging`    |
| `deploy-production`          | `production` |
| `deploy-supabase-production` | `production` |

### Secrets consumed per job

| Job               | Secrets                                                                                   |
| ----------------- | ----------------------------------------------------------------------------------------- |
| `test`            | `ALGOLIA_APP_ID`, `ALGOLIA_ADMIN_KEY`, `ALGOLIA_SEARCH_INDEX_NAME`                        |
| `storybook`       | —                                                                                         |
| `security`        | —                                                                                         |
| `configure`       | — (reads `platform/operations/delivery/branches.json`)                                             |
| `deploy-fly`      | `FLY_API_TOKEN`                                                                           |
| `deploy-supabase` | `SUPABASE_ACCESS_TOKEN`, `STAGING_SUPABASE_PROJECT_ID` / `PRODUCTION_SUPABASE_PROJECT_ID` |
| `smoke-tests`     | `STAGING_SUPABASE_URL`, `STAGING_SUPABASE_ANON_KEY`, `STAGING_SUPABASE_SERVICE_ROLE_KEY`  |

### Observations

- `workflow_dispatch` can trigger Supabase deploy jobs on any branch, but Fly deploy jobs only run on `push` to `develop`/`main`.
- The `ci-test/**` branch pattern was added to validate the staging deploy path without polluting `develop`.
- Health-check and smoke-test jobs now run after every delivery-branch deploy. The health contract is enforced by `pnpm deploy:assert-contract`.

---

## 2. Husky Hook Execution Graph

```
package.json "prepare": "husky"
  ↓
.husky/pre-commit: lint-staged
  ↓
lint-staged
  ├── *.{ts,tsx}
  │   ├── eslint --cache --fix
  │   └── prettier --cache --write
  └── *.{json,md,css}
      └── prettier --cache --write
```

### Configuration

- **Husky version:** `9.1.7`
- **lint-staged version:** `17.0.7`
- **ESLint command:** `eslint --cache --fix`
- **Prettier command:** `prettier --cache --write`
- **CI bypass:** `HUSKY=0` is set in `.github/workflows/ci.yml` globally.

### Observations

- Caching was recently enabled for both ESLint and Prettier.
- No timing instrumentation exists yet (targeted in Workstream B1).
- The `prepare` script runs `husky`, which installs hooks locally but is skipped in CI because `HUSKY=0`.

---

## 3. Deployment Pipeline Map

### Staging

```
git push develop
  → GitHub Actions: test, configure
    → deploy-fly: flyctl deploy --config platform/deployment/fly/fly.stage.toml --dockerfile platform/docker/Dockerfile
    → deploy-supabase:
        - supabase login
        - supabase link --project-ref <STAGING_SUPABASE_PROJECT_ID>
        - supabase db push [--dry-run | --yes]
        - supabase functions deploy --use-api
    → smoke-tests:
        - pnpm env:validate smoke-test
        - pnpm deploy:verify https://stage.partspeddle.com
        - pnpm deploy:assert-contract https://stage.partspeddle.com
        - pnpm ci:smoke:staging
```

### Production

```
git push main
  → GitHub Actions: test, configure
    → deploy-fly: flyctl deploy --config platform/deployment/fly/fly.prod.toml --dockerfile platform/docker/Dockerfile
    → deploy-supabase:
        - supabase login
        - supabase link --project-ref <PRODUCTION_SUPABASE_PROJECT_ID>
        - supabase db push [--dry-run | --yes]
        - supabase functions deploy --use-api
    → smoke-tests:
        - pnpm env:validate smoke-test
        - pnpm deploy:verify https://partspeddle.com
        - pnpm deploy:assert-contract https://partspeddle.com
        - pnpm ci:smoke:production
```

### Production promotion

The first validated promotion from `develop` to `main` completed on 2026-07-11. The deployment artifact is recorded at `artifacts/delivery/production-deployment-2026-07-11.json`.

### Local fallbacks

```bash
pnpm deploy:staging              # flyctl deploy --config platform/deployment/fly/fly.stage.toml --dockerfile platform/docker/Dockerfile
pnpm deploy:production           # flyctl deploy --config platform/deployment/fly/fly.prod.toml --dockerfile platform/docker/Dockerfile
bash platform/scripts/deployment/deploy.sh staging
bash platform/scripts/deployment/deploy.sh production
```

### Observations

- `platform/scripts/deployment/deploy.sh` still references `.env.staging` / `.env.production` for local deploys. This is acceptable for local fallbacks but must not be used in CI.
- No automatic health check runs after Fly.io deploy in CI (targeted in Workstream F).
- No migration verification runs after Supabase deploy in CI (targeted in Workstream F).

---

## 4. Environment Drift Certification (DC-7.1)

The `pnpm delivery:verify:env-drift --env <staging|production>` command automates DC-7.1.

It reads the canonical environment schema from `config/environment/schema.ts`, fetches secret names from `flyctl secrets list` and `gh secret list --env`, and reports:

- Missing required secrets (schema expects them, remote store lacks them).
- Orphaned secrets (remote store has them, schema does not).

Only names are compared; values are never exposed.

### Staging

```bash
pnpm delivery:verify:env-drift --env staging
```

Compared against:

- Fly.io app `vintrack-stage`
- GitHub environment `staging`

### Production

```bash
pnpm delivery:verify:env-drift --env production
```

Compared against:

- Fly.io app `vintrack-prod`
- GitHub environment `production`

### Test coverage

Unit tests in `tests/governance/environment/verify-environment-drift.test.ts` cover:

- Schema-derived expected secret names for Fly and both GitHub environments.
- Missing and orphaned secret detection.
- Environment-specific GitHub secret filtering (smoke-test secrets only required for staging).
- CLI argument parsing and usage errors.

---

## 5. Environment Variable Inventory

### Application runtime variables

| Variable                        | Required | Public | Used by                                                                   | Notes                            |
| ------------------------------- | -------- | ------ | ------------------------------------------------------------------------- | -------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | Yes      | Yes    | `src/lib/supabase.ts`                                                     | Browser/client Supabase URL      |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes      | Yes    | `src/lib/supabase.ts`                                                     | Browser/client Supabase anon key |
| `SUPABASE_URL`                  | Yes      | No     | `src/proxy.ts`, `src/lib/supabase-server.ts`, `src/lib/supabase-admin.ts` | Server Supabase URL              |
| `SUPABASE_ANON_KEY`             | Yes      | No     | `src/proxy.ts`, `src/lib/supabase-server.ts`                              | Server Supabase anon key         |
| `SUPABASE_SERVICE_ROLE_KEY`     | Yes      | No     | `src/lib/supabase-admin.ts`                                               | Server service-role key          |
| `ALGOLIA_APP_ID`                | Yes      | No     | `src/backend/modules/search/infrastructure/algolia-client.ts`, scripts    | Algolia app ID                   |
| `ALGOLIA_ADMIN_KEY`             | Yes      | No     | `src/backend/modules/search/infrastructure/algolia-client.ts`, scripts    | Algolia admin key                |
| `ALGOLIA_SEARCH_INDEX_NAME`     | No       | No     | `src/backend/modules/search/infrastructure/algolia-client.ts`, tests      | Defaults to `parts`              |
| `ALGOLIA_INDEX_PRICE_ASC`       | No       | No     | `src/backend/modules/search/infrastructure/algolia-client.ts`             | Optional index override          |
| `ALGOLIA_INDEX_PRICE_DESC`      | No       | No     | `src/backend/modules/search/infrastructure/algolia-client.ts`             | Optional index override          |
| `ALGOLIA_INDEX_NEWEST`          | No       | No     | `src/backend/modules/search/infrastructure/algolia-client.ts`             | Optional index override          |
| `GEMINI_API_KEY`                | Yes      | No     | `src/app/api/gemini/identify/route.ts`                                    | Google GenAI API key             |
| `NODE_ENV`                      | Yes      | No     | `src/lib/env.ts`, `src/lib/security-headers.ts`                           | Standard Node environment        |
| `SUPABASE_WEBHOOK_SECRET`       | Yes      | No     | Edge Functions (`send-message-notification`)                              | Webhook signature validation     |

### CI / deploy-only variables

| Variable                            | Required | Used by                      | Notes                     |
| ----------------------------------- | -------- | ---------------------------- | ------------------------- |
| `FLY_API_TOKEN`                     | Yes      | Fly.io deploy jobs           | GitHub environment secret |
| `SUPABASE_ACCESS_TOKEN`             | Yes      | Supabase deploy jobs         | GitHub environment secret |
| `STAGING_SUPABASE_PROJECT_ID`       | Yes      | `deploy-supabase-staging`    | GitHub environment secret |
| `PRODUCTION_SUPABASE_PROJECT_ID`    | Yes      | `deploy-supabase-production` | GitHub environment secret |
| `STAGING_SUPABASE_URL`              | Yes      | `smoke-staging`              | GitHub environment secret |
| `STAGING_SUPABASE_ANON_KEY`         | Yes      | `smoke-staging`              | GitHub environment secret |
| `STAGING_SUPABASE_SERVICE_ROLE_KEY` | Yes      | `smoke-staging`              | GitHub environment secret |

### Local-only / optional variables

| Variable   | Used by                           | Notes                       |
| ---------- | --------------------------------- | --------------------------- |
| `TRACE_ID` | `platform/scripts/scgs/replay-validate.ts` | Local SCGS replay debugging |

### Observations

- Runtime validation is handled by `pnpm env:validate` and drift detection by `pnpm delivery:verify:env-drift`.
- `NODE_ENV` is set to `production` in the Dockerfile runner stage.
- Several scripts under `platform/scripts/` and `src/backend/modules/search/infrastructure/algolia-client.ts` load `.env` via `dotenv`. This is acceptable for local scripts but must not be relied upon in production runtime.

---

## 6. `.env` Reference Map

### Dockerfile

- **No `.env` references.** The image is environment-agnostic.
- `HUSKY=0` is set at build time to skip hook installation.
- `NODE_ENV=production`, `PORT=3000`, `HOSTNAME=0.0.0.0` are set in the runner stage.

### `.dockerignore`

```
.env
.env.local
.env.*
```

All environment files are excluded from the Docker build context.

### Source code

Files that load `.env` directly (intended for local scripts/development):

| File                                                          | Mechanism                                                      |
| ------------------------------------------------------------- | -------------------------------------------------------------- |
| `src/lib/supabase-admin.ts`                                   | `import 'dotenv/config'`                                       |
| `src/backend/modules/search/infrastructure/algolia-client.ts` | `dotenv.config({ path: path.resolve(process.cwd(), '.env') })` |
| `platform/scripts/algolia/configure-algolia-index.ts`         | `dotenv.config(...)`                                           |
| `platform/scripts/algolia/reindex-algolia.ts`                 | `dotenv.config(...)`                                           |
| `platform/scripts/migration/verify-db.ts`                     | `dotenv.config(...)`                                           |
| `platform/scripts/migration/verify-algolia.ts`                | `dotenv.config()`                                              |
| `platform/scripts/migration/list-triggers.ts`                 | `import 'dotenv/config'`                                       |
| `platform/scripts/bootstrap/seed-production.ts`               | `dotenv.config(...)`                                           |
| `platform/scripts/bootstrap/seed-users.ts`                    | `dotenv.config(...)`                                           |
| `platform/scripts/deployment/deploy.sh`                       | sources `.env.staging` / `.env.production`                     |

### Observations

- The production Docker image does not copy `.env` files.
- Fly.io injects runtime secrets, and the application reads `process.env`.
- Some local scripts still require a `.env` file in the project root. This is acceptable for local development but should be documented.

---

## 7. Secrets Inventory

### GitHub repository-level secrets

| Secret                      | Updated    |
| --------------------------- | ---------- |
| `ALGOLIA_ADMIN_API_KEY`     | 2026-06-06 |
| `ALGOLIA_ADMIN_KEY`         | 2026-06-30 |
| `ALGOLIA_APP_ID`            | 2026-06-30 |
| `ALGOLIA_SEARCH_INDEX_NAME` | 2026-07-07 |
| `SUPABASE_ANON_KEY`         | 2026-07-11 |
| `SUPABASE_SERVICE_ROLE_KEY` | 2026-07-11 |

### GitHub `staging` environment secrets

| Secret                              | Updated    |
| ----------------------------------- | ---------- |
| `FLY_API_TOKEN`                     | 2026-07-11 |
| `SUPABASE_ACCESS_TOKEN`             | 2026-07-11 |
| `STAGING_SUPABASE_PROJECT_ID`       | 2026-07-07 |
| `STAGING_URL`                       | 2026-07-07 |
| `STAGING_SUPABASE_URL`              | 2026-07-07 |
| `STAGING_SUPABASE_ANON_KEY`         | 2026-07-11 |
| `STAGING_SUPABASE_SERVICE_ROLE_KEY` | 2026-07-11 |

### GitHub `production` environment secrets

| Secret                           | Updated    |
| -------------------------------- | ---------- |
| `FLY_API_TOKEN`                  | 2026-07-11 |
| `SUPABASE_ACCESS_TOKEN`          | 2026-07-11 |
| `PRODUCTION_SUPABASE_PROJECT_ID` | 2026-07-07 |

### Fly.io secrets

Run the automated drift check (`pnpm delivery:verify:env-drift`) or list manually:

```bash
flyctl secrets list -a vintrack-stage
flyctl secrets list -a vintrack-prod
```

Redact values, keep names.

### Supabase secrets/tokens

- `SUPABASE_ACCESS_TOKEN` (PAT) is stored in GitHub environments.
- Supabase service-role and anon keys are stored in GitHub environments and should also be set as Fly.io secrets.

### Observations

- Repo-level `SUPABASE_ANON_KEY` and `SUPABASE_SERVICE_ROLE_KEY` appear to duplicate staging environment secrets. These are likely used by the `test` job (which has no environment) or local scripts.
- Repo-level `ALGOLIA_*` secrets are used by the `test` job.
- No repo-level `SUPABASE_ACCESS_TOKEN` or `FLY_API_TOKEN` remains (removed during CI/CD consolidation).

---

## 8. Stage Dependency Map

```
lint (pnpm lint --cache apps/web/src platform/scripts)
  ↓
typecheck (pnpm typecheck: tsc --noEmit)
  ↓
test (pnpm test: vitest run tests/unit tests/integration tests/regression tests/governance tests/certification tests/performance)
  ↓
storybook build (pnpm storybook:build)
security tests (pnpm test -- tests/security; pnpm build && pnpm security:bundle-audit)
  ↓
deploy-staging / deploy-supabase-staging (parallel, both need test)
  ↓
smoke-staging (needs both deploys)
```

### Build script

- `pnpm build` → `next build` (produces `.next/standalone` for Docker).

### Deploy scripts

- `pnpm deploy:staging` → `flyctl deploy --config platform/deployment/fly/fly.stage.toml --dockerfile platform/docker/Dockerfile`
- `pnpm deploy:production` → `flyctl deploy --config platform/deployment/fly/fly.prod.toml --dockerfile platform/docker/Dockerfile`

### Smoke test script

- `pnpm ci:smoke:staging` → `tsx platform/scripts/ci/smoke-staging.ts`

---

## 9. Findings & Risks

| #   | Findings & Risks                                                    | Status       | Risk                                                    | Priority | Owner Workstream |
| --- | ---------------------------------------------------------- | ------------ | ------------------------------------------------------- | -------- | ---------------- |
| 1   | No CI health-check job after Fly.io deploy                 | **Resolved** | A broken deployment can go unnoticed                    | High     | F                |
| 2   | No migration verification after Supabase deploy            | **Resolved** | Drift between repo and remote may persist               | High     | F                |
| 3   | Runtime environment validation is manual                   | Open         | Missing secrets fail late or silently                   | Medium   | D                |
| 4   | Several scripts load `.env` directly                       | Open         | Easy to accidentally depend on local files in CI        | Medium   | C/D              |
| 5   | No deployment observability records                        | **Resolved** | Hard to trace releases or roll back                     | Medium   | G                |
| 6   | Husky timing not instrumented                              | Open         | Cannot measure if pre-commit is <5s                     | Medium   | B                |
| 7   | `platform/scripts/deployment/deploy.sh` sources `.env.*`   | Open         | Local deploy fallback may be confused with CI path      | Low      | C                |
| 8   | Repo-level Supabase keys duplicate staging env secrets     | Open         | Potential confusion about which secret is authoritative | Low      | D                |
| 9   | No automated environment drift detection                   | **Resolved** | Manual audits miss missing or orphaned secrets          | Medium   | E                |

Resolved findings are implemented in `.github/workflows/ci.yml`, `platform/operations/delivery/`, and `platform/scripts/deployment/`.

---

## 10. Recommended Next Steps

1. **Workstream C — Docker hardening:** Verify `docker build .` passes without local env files and document the immutable-image contract.
2. **Workstream B — Husky stabilization:** Instrument and profile pre-commit; root-cause any slowness.
3. **Workstream D — Environment standardization:** Keep `config/environment/generated/*.md` synchronized with `schema.ts`; close any gaps between repo-level and environment secrets.
4. **Workstream G — Deployment observability:** Expand deployment artifacts to include image digest and Fly release version, and emit one artifact per environment.

---

## 11. Data Still Needed

To keep the audit current:

1. Run the automated drift check to confirm current remote state:
   ```bash
   pnpm delivery:verify:env-drift --env staging
   pnpm delivery:verify:env-drift --env production
   ```
2. Confirmation that the environment variable inventory above is complete and accurate.
3. Optional: output of `docker build .` from a clean working tree.
