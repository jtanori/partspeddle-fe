# DC — Delivery Certification

**Status:** Evidence gathering in progress. No code changes until certification gates are measured and accepted.  
**Replaces:** `.planning/d0-delivery-infrastructure-stabilization.md` (superseded by this certification framing).  
**Scope:** Certify that the delivery pipeline is deterministic, observable, and reproducible before resuming architectural work or production cutover.

---

## Context

The `docs/operations/delivery-audit.md` baseline shows the repository is approximately **90% of the way to a production-grade delivery pipeline**. The remaining work is operational hardening, not architectural redesign.

The original CI failure (`cp: cannot stat '.env'`) was caused by an older Dockerfile that copied a local `.env` file. That was fixed in PR #85. The current Dockerfile is environment-agnostic and `.dockerignore` excludes all `.env*` files.

This initiative treats delivery readiness as a formal certification effort, similar to SCGS and search subsystem certifications.

---

## Certification Gates

### DC-0 — Delivery Baseline / Toolchain Certification

**Acceptance Criteria:**

- [ ] All toolchain versions are recorded and pinned where possible (Node, pnpm, Docker, Flyctl, Supabase CLI, GitHub CLI, Git).
- [ ] A clean clone can install dependencies and run key scripts without environment-specific workarounds.
- [ ] Baseline is stored in `docs/operations/delivery-baseline.md`.

**Evidence Required:**

- Output of `.planning/temp/benchmark-delivery.sh` (toolchain section).
- `package.json#engines` and `packageManager` field review.

---

### DC-1 — Local development workflow is deterministic

**Acceptance Criteria:**

- [ ] `docker build .` succeeds from a clean checkout with no local `.env` files.
- [ ] The build produces a runnable image.
- [ ] Local development still works with `.env.local` outside the image.

**Evidence Required:**

- Output of `docker build .`.

**Status:** Functional behavior verified; pending performance validation on a cold dependency install.

---

### DC-2 — Git hooks complete within target latency

**Acceptance Criteria:**

- [ ] Pre-commit validation completes in <5 seconds for a representative change (<20 staged files).
- [ ] Each stage (`husky` → `lint-staged` → `eslint` → `prettier`) is measured.
- [ ] Root cause of any slowness is identified before configuration changes.

**Evidence Required:**

- Output of `time git commit --allow-empty -m "perf: husky benchmark"` (or equivalent small staged change).
- Independent timings for `npx lint-staged`, `npx eslint`, `npx prettier`, and `git add`.

**Working Hypothesis:** ESLint and Prettier stages complete quickly; latency appears to live in lint-staged startup / child-process orchestration. Final root cause pending benchmark script results.

---

### DC-3 — Docker builds are immutable and environment-independent

**Acceptance Criteria:**

- [ ] Dockerfile does not reference `.env` files.
- [ ] `.dockerignore` excludes all environment files.
- [ ] Image build succeeds without any local environment files present.
- [ ] Application reads only `process.env` at runtime.

**Evidence Required:**

- Current `Dockerfile` and `.dockerignore` review.
- Successful `docker build .` log.

---

### DC-4 — Staging deployment is fully automated

**Acceptance Criteria:**

- [ ] Every push to `develop` triggers an automatic staging deployment.
- [ ] Fly.io staging deploy succeeds.
- [ ] Supabase staging migration push succeeds.
- [ ] Edge Functions deploy to staging succeeds.
- [ ] Staging smoke tests pass.

**Evidence Required:**

- Latest GitHub Actions `develop` deployment run log.
- Confirmation that `Deploy Staging to Fly.io`, `Deploy Supabase to Staging`, and `Staging Smoke Tests` jobs pass.

---

### DC-5 — Production deployment is fully automated

**Acceptance Criteria:**

- [ ] Every push to `main` triggers an automatic production deployment.
- [ ] Fly.io production deploy succeeds.
- [ ] Supabase production migration push succeeds.
- [ ] Edge Functions deploy to production succeeds.

**Evidence Required:**

- Latest GitHub Actions `main` deployment run log.
- Confirmation that `Deploy Production to Fly.io` and `Deploy Supabase to Production` jobs pass.

**Blocked until:** DC-4 is certified and operator approves production touch.

---

### DC-6 — Post-deployment verification and rollback procedures are in place

**Acceptance Criteria:**

- [ ] Runtime environment validation happens inside the deployed container (Option D: GitHub Actions never holds production runtime secrets merely to validate them).
- [ ] `/api/health` reports structured readiness including: environment, database, Algolia.
- [ ] A deployment verification script polls `/api/health` after every Fly.io deploy and fails the pipeline if checks do not pass within the timeout.
- [ ] Smoke tests run automatically after deployment verification succeeds.
- [ ] Rollback runbook exists and is accurate.

**Deployment Verification Pipeline:**

```
Deploy Image
    ↓
Container Starts
    ↓
EGS Runtime Validation
    ↓
Database Connectivity
    ↓
Algolia Connectivity
    ↓
Health Endpoint
    ↓
Smoke Tests
    ↓
Deployment Success
```

**Evidence Required:**

- `src/lib/health-checks.ts` integrated with EGS.
- `scripts/ops/verify-deployment.ts` polling `/api/health`.
- Updated `.github/workflows/ci.yml` with `pnpm ci:verify:staging` before smoke tests.
- `docs/operations/recovery-runbook.md`.

---

### DC-7 — Environment Governance System (EGS)

**Acceptance Criteria:**

- [ ] A single source of truth documents every environment variable.
- [ ] Each variable is classified: required/optional, secret/public, environment scope.
- [ ] A TypeScript schema defines all variables.
- [ ] A validator fails fast at startup and in CI if required variables are missing or malformed.
- [ ] Secret storage policy is documented and followed (repo vs. environment vs. Fly secrets).
- [ ] Generated docs stay in sync with the schema.

**Evidence Required:**

- `config/environment/schema.ts` and `validate.ts`.
- `config/environment/classify.ts`.
- `config/environment/README.md`.
- Generated `config/environment/generated/{required,public,secrets}.md`.
- `docs/operations/secret-governance.md`.
- Fly.io secret lists for `vintrack-stage` and `vintrack-prod` (values redacted).
- CI integration of `pnpm env:validate`.

---

### DC-7.1 — Environment Drift Certification

**Acceptance Criteria:**

- [ ] Every deployment environment exposes the same set of required runtime variables.
- [ ] Drift is checked by variable **presence**, not values.
- [ ] A generated drift matrix exists and is kept in sync with the schema.
- [ ] CI or operational tooling can compare two environments against the matrix.

**Evidence Required:**

- `config/environment/generated/drift-matrix.md`.
- Script or CI step that compares Fly secret lists / GitHub environment secrets against the matrix.

---

### DC-8 — Delivery pipeline is observable and reproducible

**Acceptance Criteria:**

- [ ] Every deployment produces a machine-readable record.
- [ ] Record contains: commit SHA, branch, environment, image digest, duration, health-check result, smoke-test result, migration result.
- [ ] Records can be queried without GitHub UI access.

**Evidence Required:**

- `scripts/ops/record-deployment.ts`.
- `artifacts/deployments/` structure and sample records.
- `docs/operations/deployment-observability.md`.

---

## Execution Phases

Revised order: **DC-4 → DC-7 → DC-7.1 → DC-6 → DC-8 → DC-5**, with **DC-0** captured in parallel and **DC-2** addressed only after benchmark evidence identifies the true bottleneck.

### Phase 0 — Toolchain Baseline (DC-0)

Record pinned toolchain versions and clean-clone behavior. No production changes.

### Phase 1 — Baseline Evidence (current)

No code changes. Gather evidence for DC-1, DC-2, DC-3, DC-4 using `.planning/temp/benchmark-delivery.sh`.

### Phase 2 — Environment Governance System (DC-7 + DC-7.1)

Implement EGS: schema, validator, classification, generated docs, secret policy, drift matrix.

### Phase 3 — Deployment Verification (DC-6)

Add runtime environment check to `/api/health`, deployment verification script, and CI integration. Depends on DC-7 because "healthy" must be defined by the environment schema.

### Phase 4 — Observability (DC-8)

Add machine-readable deployment records and reporting. Depends on DC-6/DC-7.

### Phase 5 — Production Certification (DC-5)

Certify production deployment path. Blocked until DC-4 through DC-8 are complete and operator explicitly approves.

### Phase 6 — Husky Optimization (DC-2)

Address only after benchmark evidence shows where the latency truly lives.

---

PR #91 (`feat/d0-workstream-a-audit` → `ci-test/pipeline-hardening`) opened for CI validation of EGS, DC-6, and Operational Manifest.

## Evidence Log

| Gate   | Evidence                                         | Status        | Notes                                                                                                                                                                                                                        |
| ------ | ------------------------------------------------ | ------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| DC-0   | Toolchain versions + clean-clone behavior        | Passed        | Benchmark run complete. Toolchain captured: Node v24.14.1, pnpm 9.15.0, Docker 25.0.5, Flyctl v0.4.63, Supabase CLI 2.109.1, gh 2.88.1. Results archived in `artifacts/delivery/benchmark-2026-07-11/summary.json`.            |
| DC-1   | `docker build .` output                          | Functional ✅ | No `.env` references in Dockerfile; `.dockerignore` excludes env files. Cold build previously timed out at 600 s. Benchmark could not run docker build on macOS because `timeout` is unavailable; script updated to use `gtimeout` or run without timeout.          |
| DC-2   | Husky timing output                              | Measured      | Benchmark: `git commit` with Husky = **47 s**; without Husky = **9 s**. lint-staged alone = **39 s**; ESLint single file = **15 s**; full `src/` ESLint = **68 s**. Root cause: lint-staged startup/git orchestration dominates. |
| DC-3   | Dockerfile + .dockerignore review + docker build | Measured      | Dockerfile contains no `.env` references and is environment-agnostic. `.dockerignore` excludes `.env*`.                                                                                                                      |
| DC-4   | Latest `develop` GitHub Actions run              | Passed        | Run `29151750670` conclusion `success`. Deploy Staging to Fly.io ✅, Deploy Supabase to Staging ✅, Staging Smoke Tests ✅. One non-fatal Fly proxy warning noted for later review.                                          |
| DC-5   | Latest `main` GitHub Actions run                 | Not started   | Blocked until DC-4 through DC-8 are complete and operator approves production touch.                                                                                                                                         |
| DC-6   | CI verification jobs + recovery runbook          | Implemented   | Runtime env check in `/api/health`; `scripts/ops/verify-deployment.ts` reads from delivery manifest; CI smoke-staging job runs `pnpm ci:verify:staging` before smoke tests; recovery runbook created. Pending CI validation. |
| DC-7   | Environment schema + validator + secret policy   | Implemented   | EGS implemented: schema with `provider` metadata, classify, validate, generated docs, secret-governance.md. Smoke-test validation in CI. Operational Manifest introduced for delivery platform metadata.                     |
| DC-7.1 | Environment drift matrix                         | In progress   | `config/environment/generated/drift-matrix.md` generated. Automated drift check against Fly/GitHub secrets pending.                                                                                                          |
| DC-8   | Deployment records + observability docs          | Not started   | Depends on DC-6/DC-7.                                                                                                                                                                                                        |

---

## Relationship to Other Work

- **P6 production migration** remains blocked until DC-4 through DC-8 and DC-5 are certified.
- **Final `develop → main` merge** remains blocked until DC-5 is certified.
- **A0 architecture convergence** remains deferred until DC-8 is certified.

---

## Notes

- No production changes until DC-4 through DC-8 are certified and operator explicitly approves.
- The `ci-test/pipeline-hardening` branch can be used to validate CI changes without polluting `develop`.
- **DC-7 is the next implementation milestone** (Environment Governance System).
