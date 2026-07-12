# D0 — Delivery Infrastructure Stabilization

**Status:** Planning complete — awaiting review before execution.  
**Previous plan:** `governance/planning/archive/master-plan-2026-07-11.md` (archived).  
**Scope:** Harding the CI/CD pipeline so that every commit to `develop`/`main` deploys to staging/production automatically, deterministically, and observably. P6 production application and the final `develop → main` merge are paused until D0 acceptance criteria are met.

---

## Objectives

By the end of D0 the following must be true:

1. **Pre-commit validation completes in <5 seconds** for normal changes (<20 staged files).
2. **Every push to `develop` deploys automatically to staging** and passes health checks.
3. **Every push to `main` deploys automatically to production** and passes health checks.
4. **Every deployment is reproducible from a clean clone** — no local machine state required.
5. **Every deployment is observable** — deployment ID, git SHA, duration, image tag, environment, health status, and rollback candidate are recorded.
6. **No deployment depends on copying `.env` files into the image** — runtime secrets only.
7. **Recovery is documented** — failed deployments produce logs, rollback steps, and notifications.

---

## Workstream A — Repository Audit

**Goal:** Establish a known-good baseline before changing anything.

### Tasks

- [ ] A.1 Record the current CI workflow graph (jobs, dependencies, conditions, environments).
- [ ] A.2 Record the Husky hook execution graph (`prepare` → `pre-commit` → `lint-staged` → `eslint`/`prettier`).
- [ ] A.3 Record the deployment pipeline (GitHub Actions → Fly.io, Supabase, smoke tests).
- [ ] A.4 Inventory all environment variables and classify each as required/optional/secret/public.
- [ ] A.5 Identify every place `.env` files are referenced in code, scripts, Dockerfile, or CI.
- [ ] A.6 Inventory secrets and where they are stored (GitHub repo secrets, GitHub environment secrets, Fly.io, Supabase, local `.env.*`).
- [ ] A.7 Produce a dependency map of the lint/test/build/deploy stages.

### Deliverable

- `docs/operations/delivery-audit.md`

### Acceptance Criteria

- The audit document is accurate as of the start of D0.
- No `.env` reference or secret is undocumented.

---

## Workstream B — Husky / lint-staged Stabilization

**Goal:** Make pre-commit validation fast and reliable.

### Phase B1 — Instrumentation

- [ ] B1.1 Add timing wrappers to measure `pre-commit` → `lint-staged` → `eslint` → `prettier`.
- [ ] B1.2 Record elapsed time, CPU, memory, and files processed for representative commits.
- [ ] B1.3 Capture output of:
  - `node -v`, `npm -v`, `git --version`
  - `time npx lint-staged --debug`
  - `time pnpm lint`
  - `time pnpm typecheck`

### Phase B2 — Root Cause Analysis

- [ ] B2.1 Analyze ESLint Flat Config for type-aware rules, Storybook plugin scope, circular imports, and expensive rules.
- [ ] B2.2 Determine whether the hang is ESLint, Prettier, type-aware linting, plugin resolution, or large staged sets.
- [ ] B2.3 Document the root cause with evidence.

### Phase B3 — Optimization

- [ ] B3.1 Enable ESLint and Prettier caches (already partially done; verify and finalize).
- [ ] B3.2 Scope expensive plugins (e.g., Storybook) to their relevant files only.
- [ ] B3.3 Move expensive/type-aware checks to CI if they do not belong in pre-commit.
- [ ] B3.4 Ensure pre-commit completes in <5 seconds for <20 staged files.

### Deliverables

- `docs/operations/husky-performance-report.md`
- Updated `.husky/pre-commit`, `lint-staged` config, and `eslint.config.*` if needed.

### Acceptance Criteria

- `time npx lint-staged` < 5 seconds for a representative change.
- CI still runs the full lint/typecheck/test suite.

---

## Workstream C — Docker Hardening

**Goal:** Build an immutable, environment-agnostic Docker image.

### Tasks

- [ ] C.1 Verify the Dockerfile no longer copies `.env` files.
- [ ] C.2 Confirm the application reads only `process.env` at runtime.
- [ ] C.3 Verify `docker build .` succeeds with zero local env files in the build context.
- [ ] C.4 Confirm local development still works via `.env.local` outside the image.
- [ ] C.5 Document the immutable-image contract.

### Deliverables

- Updated `Dockerfile` and `.dockerignore` (already partially done; verify and finalize).
- `docs/operations/docker-contract.md`

### Acceptance Criteria

- `docker build .` passes from a clean clone without `.env` files.
- Fly.io staging/production deploys use the same image shape.

---

## Workstream D — Environment Standardization

**Goal:** Create a canonical, documented environment specification.

### Tasks

- [ ] D.1 Create `config/environment/required-env.md` listing every variable, its source, and whether it is required/optional/secret/public.
- [ ] D.2 Create per-environment summaries for development, staging, and production.
- [ ] D.3 Add a validation script that fails build/start if required variables are missing.
- [ ] D.4 Document the mapping between `.env.staging`/`.env.production` keys and GitHub/Fly/Supabase secret names.

### Deliverables

- `config/environment/required-env.md`
- `config/environment/development.md`
- `config/environment/staging.md`
- `config/environment/production.md`
- Environment validation script (e.g., `scripts/ops/validate-env.ts`).

### Acceptance Criteria

- Every env var is documented.
- Missing required variables fail fast with a clear error.

---

## Workstream E — Fly.io Verification

**Goal:** Confirm Fly.io is correctly configured and deployable without local state.

### Tasks

- [ ] E.1 Verify `flyctl auth whoami` succeeds.
- [ ] E.2 Confirm both staging and production apps exist in `fly apps list`.
- [ ] E.3 Compare `fly secrets list` for both apps against `required-env.md`.
- [ ] E.4 Identify and fix any missing secrets.
- [ ] E.5 Verify a deployment from CI succeeds without local env files.

### Deliverables

- `docs/operations/fly-io-configuration.md`
- Updated Fly secrets if gaps are found.

### Acceptance Criteria

- Both apps have all required secrets.
- `git push develop` triggers an automatic, successful Fly.io staging deployment.

---

## Workstream F — GitHub Actions Hardening

**Goal:** Make the CI/CD pipeline deterministic, staged, and failure-resistant.

### Tasks

- [ ] F.1 Define the canonical pipeline graph:
  ```
  Lint → Typecheck → Tests → Build → Security → Deploy → Smoke Test → Health Check → Notify
  ```
- [ ] F.2 Ensure each stage depends only on the previous stage.
- [ ] F.3 Add deployment verification (health endpoint) after Fly.io deploys.
- [ ] F.4 Add migration verification after Supabase deploys.
- [ ] F.5 Confirm environment-scoped secrets are used for staging and production.
- [ ] F.6 Remove or document any remaining repo-level secrets that duplicate environment secrets.

### Deliverables

- Updated `.github/workflows/ci.yml`.
- `docs/operations/ci-pipeline.md`

### Acceptance Criteria

- Pipeline graph is explicit in the workflow file.
- A failed deployment blocks downstream jobs.
- A successful deployment is verified before the run completes.

---

## Workstream G — Observability

**Goal:** Record every deployment artifact and status.

### Tasks

- [ ] G.1 Emit a deployment record containing: deployment ID, git SHA, duration, image tag, environment, health status, rollback candidate.
- [ ] G.2 Store records in `artifacts/deployments/` (committed by CI or attached as run artifacts).
- [ ] G.3 Add simple CLI/report command to list recent deployments.

### Deliverables

- `scripts/ops/record-deployment.ts`
- `artifacts/deployments/` structure and schema.
- `docs/operations/deployment-observability.md`

### Acceptance Criteria

- Every deployment produces a machine-readable record.
- Records can be queried without GitHub UI access.

---

## Workstream H — Recovery

**Goal:** Document and automate rollback for failed deployments.

### Tasks

- [ ] H.1 Define rollback triggers (health check failure, smoke test failure, error rate threshold).
- [ ] H.2 Document manual rollback steps for Fly.io (`fly deploy --image`) and Supabase (compensating migration or backup restore).
- [ ] H.3 Add a GitHub Actions job or script that collects logs on deployment failure.
- [ ] H.4 Document notification targets and channels.

### Deliverables

- `docs/operations/recovery-runbook.md`
- `scripts/ops/rollback-deployment.sh`
- Failure-handling additions to `.github/workflows/ci.yml`.

### Acceptance Criteria

- Any team member can follow the runbook to roll back staging or production.
- Failed deployments automatically collect relevant logs.

---

## Final Deliverables

By the end of D0 the repository should contain:

```
docs/operations/
  delivery-audit.md
  husky-performance-report.md
  docker-contract.md
  environments.md
  fly-io-configuration.md
  ci-pipeline.md
  deployment-observability.md
  recovery-runbook.md
  troubleshooting.md

config/environment/
  required-env.md
  development.md
  staging.md
  production.md

scripts/ops/
  validate-env.ts
  record-deployment.ts
  rollback-deployment.sh

artifacts/deployments/
  <deployment-records>
```

---

## Data Needed Before Execution

To begin work, please provide the following artifacts or confirm I may gather them from the repository.

### 1. Complete Dockerfile

I have read the current `Dockerfile`, but please confirm it is the latest version and that no build args or env-file copy steps remain.

### 2. Complete GitHub Actions workflow

Already available at `.github/workflows/ci.yml`. I will trace it during the audit.

### 3. Complete ESLint configuration

Already available at `eslint.config.*`. I will profile it during Workstream B.

### 4. Local command outputs

Run these from a clean working tree and share the results:

```bash
node -v
npm -v
git --version

time npx lint-staged --debug
time pnpm lint
time pnpm typecheck
```

### 5. Fly.io configuration

Run these and redact secret values, keeping variable names:

```bash
flyctl version
flyctl auth whoami
flyctl apps list
flyctl status -a vintrack-stage
flyctl status -a vintrack-prod
flyctl secrets list -a vintrack-stage
flyctl secrets list -a vintrack-prod
```

### 6. Optional but valuable

```bash
docker build .
```

If this fails the same way as CI, it confirms the issue is Dockerfile-specific, not Fly-specific.

---

## What Will Be Produced

Once the artifacts above are available, I will deliver:

1. **Root Cause Analysis (RCA)** with evidence for Husky and Fly.io issues.
2. **Step-by-step remediation plan** with isolated, low-risk changes.
3. **CI/CD architecture review** against current best practices.
4. **Revised GitHub Actions workflow** with deterministic stages and deployment verification.
5. **Revised Dockerfile** based on immutable-image principles.
6. **Husky/lint-staged optimization** with measurable performance targets.
7. **Operational runbooks** covering deployment, rollback, troubleshooting, and validation.

---

## Execution Order

1. **Workstream A** — Audit (no code changes).
2. **Workstream C** — Docker hardening (highest deployment impact).
3. **Workstream B** — Husky stabilization (highest developer-experience impact).
4. **Workstream D** — Environment standardization (unblocks E and F).
5. **Workstream E** — Fly.io verification.
6. **Workstream F** — GitHub Actions hardening.
7. **Workstream G** — Observability.
8. **Workstream H** — Recovery.

---

## Acceptance Criteria for D0

- [ ] `git push develop` → full CI → staging deploy → health check → smoke tests → PASS.
- [ ] `git push main` → full CI → production deploy → health check → PASS.
- [ ] Pre-commit validation <5 seconds for <20 staged files.
- [ ] Dockerfile builds without local `.env` files.
- [ ] All required env vars documented and validated.
- [ ] Rollback runbook tested and accurate.

---

## Notes

- The `ci-test/pipeline-hardening` branch can be reused to validate changes without polluting `develop`.
- The remaining P6 production migration and final `develop → main` merge are **blocked** until D0 acceptance criteria are met.
- No production changes will be made during D0.
