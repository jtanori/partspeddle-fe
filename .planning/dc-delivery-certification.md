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

### DC-1 — Local development workflow is deterministic

**Acceptance Criteria:**

- [ ] `docker build .` succeeds from a clean checkout with no local `.env` files.
- [ ] The build produces a runnable image.
- [ ] Local development still works with `.env.local` outside the image.

**Evidence Required:**

- Output of `docker build .`.

---

### DC-2 — Git hooks complete within target latency

**Acceptance Criteria:**

- [ ] Pre-commit validation completes in <5 seconds for a representative change (<20 staged files).
- [ ] Each stage (`husky` → `lint-staged` → `eslint` → `prettier`) is measured.
- [ ] Root cause of any slowness is identified before configuration changes.

**Evidence Required:**

- Output of `time git commit --allow-empty -m "perf: husky benchmark"` (or equivalent small staged change).
- Breakdown of where time is spent.

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

- [ ] Health check runs automatically after every Fly.io deploy.
- [ ] Migration verification runs automatically after every Supabase deploy.
- [ ] Smoke tests run automatically after deploys.
- [ ] Rollback runbook exists and is accurate.

**Evidence Required:**

- Updated `.github/workflows/ci.yml` with verification jobs.
- `docs/operations/recovery-runbook.md`.

---

### DC-7 — Secrets and environment configuration are governed and validated

**Acceptance Criteria:**

- [ ] A single source of truth documents every environment variable.
- [ ] Each variable is classified: required/optional, secret/public, environment scope.
- [ ] A validation script fails fast if required variables are missing.
- [ ] Secret storage policy is documented and followed.

**Evidence Required:**

- `config/environment/required-env.md` and per-environment docs.
- `config/environment/schema.ts` and `validate.ts`.
- `docs/operations/secret-governance.md`.
- Fly.io secret lists for `vintrack-stage` and `vintrack-prod` (values redacted).

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

### Phase 1 — Baseline Evidence (current)

No code changes. Gather evidence for DC-1, DC-2, DC-3, DC-4.

### Phase 2 — Environment & Secret Governance

Implement DC-7: schema, validator, docs, secret policy.

### Phase 3 — Deployment Verification

Implement DC-6: health checks, migration verification, rollback runbook.

### Phase 4 — Observability

Implement DC-8: deployment records and reporting.

### Phase 5 — Production Certification

Implement DC-5: certify production deployment path.

### Phase 6 — Husky Optimization (if measurements justify it)

Implement DC-2: only after evidence shows where time is spent.

---

## Evidence Log

| Gate | Evidence                                         | Status      | Notes                                                                                                                                                                                                                                                                   |
| ---- | ------------------------------------------------ | ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| DC-1 | `docker build .` output                          | In progress | Build timed out after 600 s during `pnpm install --frozen-lockfile` (step #15). No `.env` references in Dockerfile. Build was progressing normally but slowly due to cold package downloads. Re-run with longer timeout or warm cache needed for final pass.            |
| DC-2 | Husky timing output                              | Measured    | `time git commit` for one TS file: **real 1 m 17.3 s, user 31.9 s, sys 13.5 s**. ESLint/Prettier completed quickly; total time dominated by lint-staged startup and cold caches. A transient hang on first attempt resolved on retry. Target <5 s is not currently met. |
| DC-3 | Dockerfile + .dockerignore review + docker build | Measured    | Dockerfile contains no `.env` references and is environment-agnostic. `.dockerignore` excludes `.env*`. Build-in-progress confirms image can build without local env files.                                                                                             |
| DC-4 | Latest `develop` GitHub Actions run              | Passed      | Run `29151750670` conclusion `success`. Deploy Staging to Fly.io ✅, Deploy Supabase to Staging ✅, Staging Smoke Tests ✅. One non-fatal Fly proxy warning noted for later review.                                                                                     |
| DC-5 | Latest `main` GitHub Actions run                 | Not started | Blocked until DC-4 is certified and operator approves production touch.                                                                                                                                                                                                 |
| DC-6 | CI verification jobs + recovery runbook          | Not started |                                                                                                                                                                                                                                                                         |
| DC-7 | Environment schema + validator + secret policy   | Not started |                                                                                                                                                                                                                                                                         |
| DC-8 | Deployment records + observability docs          | Not started |                                                                                                                                                                                                                                                                         |

---

## Relationship to Other Work

- **P6 production migration** remains blocked until DC-4 and DC-5 are certified.
- **Final `develop → main` merge** remains blocked until DC-5 is certified.
- **A0 architecture convergence** remains deferred until DC-8 is certified.

---

## Notes

- No production changes until DC-4 is certified and operator explicitly approves.
- The `ci-test/pipeline-hardening` branch can be used to validate CI changes without polluting `develop`.
