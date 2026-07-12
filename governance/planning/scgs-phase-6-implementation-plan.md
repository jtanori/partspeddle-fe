# SCGS Phase 6 — Governance & CI Integration

**Goal:** Make SCGS gates real in CI and provide durable governance observability.

**Branch:** `feat/scgs-phase-6-governance-ci-integration`

**Source plan:** `governance/planning/scgs-spec-implementation-plan.md` § Phase 6.

**Boundary rule:** This phase intentionally does **not** add marketplace features, rewrite the Algolia index pipeline, or change listing/seller database tables. It focuses on governance enforcement, durable replay storage, and CI wiring.

---

## 1. Scope

### In scope

1. Real `scgs:ci:decide` script that evaluates governance controller + PTS + policy and returns `PASS | WARN | BLOCK`.
2. CI gate in `.github/workflows/ci.yml` after the `test` job.
3. Durable replay trace storage adapter backed by Supabase Storage (production/staging) with local filesystem fallback (dev).
4. Real PRR enforcement: determinism, PTS stability, snapshot integrity, PTS contract integrity.
5. Dashboard read-model wired to stored traces and artifacts.
6. Cleanup of stale `package.json` scripts.
7. Module-owned tests for governance, replay storage, CI decision, and PRR.
8. Updated documentation.

### Out of scope

- Recommendation engine (Phase 7).
- Live search projection (Phase 7).
- Rewriting admin dashboard UI components (we wire the existing skeleton only).
- S3 adapter (Supabase Storage is sufficient; S3-compatible can be added later behind the same port).

---

## 2. Deliverables and Execution Order

### 2.1 Domain ports and types

Files:

- `apps/web/src/backend/modules/scgs/domain/replay/replay-store.port.ts` — `ReplayStore` port with `save(trace)`, `load(lineageId)`, `list(options)`.
- `apps/web/src/backend/modules/scgs/domain/governance/ci-decision.ts` — `CIDecision` union and reason codes.
- `apps/web/src/backend/modules/scgs/domain/governance/prr-report.ts` — `PRRReport` type for PRR output.

### 2.2 Infrastructure adapters

Files:

- `apps/web/src/backend/modules/scgs/infrastructure/replay/supabase-replay-store.ts` — Supabase Storage adapter implementing `ReplayStore`.
- `apps/web/src/backend/modules/scgs/infrastructure/replay/filesystem-replay-store.ts` — current filesystem logic extracted into adapter.
- `apps/web/src/backend/modules/scgs/infrastructure/replay/replay-store.factory.ts` — selects adapter by environment.

Changes:

- Refactor `apps/web/src/backend/modules/scgs/domain/replay/store.ts` to implement the port or be replaced by the filesystem adapter.
- Update `apps/web/src/backend/modules/scgs/domain/replay/validator.ts` to use the port for snapshot integrity checks.

### 2.3 Application use cases

Files:

- `apps/web/src/backend/modules/scgs/application/evaluate-governance.ts` — ties controller + policy + PTS into a CI decision.
- `apps/web/src/backend/modules/scgs/application/replay-trace.ts` — generates, validates, and persists a replay trace between two artifacts.
- `apps/web/src/backend/modules/scgs/application/run-prr.ts` — runs all PRR checks and returns a report.
- `apps/web/src/backend/modules/scgs/application/build-dashboard-read-model.ts` — builds dashboard data from stored traces.

### 2.4 Scripts

Files:

- `platform/scripts/scgs/ci-decide.ts` — replace stub. Loads previous + current artifact, computes diff, runs `evaluate-governance`, prints JSON verdict, exits with 0/1/2.
- `platform/scripts/scgs/prr.ts` — replace stubbed checks. Invokes `run-prr` use case.
- `platform/scripts/scgs/replay-validate.ts` — use real artifacts from storage instead of mock `{}`.

Cleanup:

- `package.json`: fix `scgs:ci:decide` and `scgs:ci:enforce` paths to `.ts`; remove or alias scripts pointing to missing files (`scgs:evaluate`, `scgs:snapshot:load`, `scgs:diff`, `scgs:pts:compute`).

### 2.5 CI workflow

File: `.github/workflows/ci.yml`

Add a `scgs-governance` job after `test`:

```yaml
scgs-governance:
  name: SCGS Governance
  needs: test
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v4
    - uses: ./.github/actions/setup-pnpm-node
    - name: Run SCGS CI decision
      run: pnpm scgs:ci:decide
      env:
        SCGS_ENV: ci
        SCGS_PREVIOUS_ARTIFACT_URI: ${{ vars.SCGS_PREVIOUS_ARTIFACT_URI }}
        SCGS_CURRENT_ARTIFACT_URI: ${{ vars.SCGS_CURRENT_ARTIFACT_URI }}
        SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
        SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}
```

Make the job allowed to fail with warnings (`continue-on-error: true`) initially, then harden after a green baseline.

### 2.6 Dashboard wiring

Files:

- `apps/web/src/app/(admin)/scgs/dashboard/[category]/page.tsx` — replace mock data with `buildDashboardReadModel`.
- `apps/web/src/app/api/admin/scgs/dashboard/route.ts` — new API route returning dashboard read model (optional; page can call use case directly during SSR).

### 2.7 Tests

New module-owned tests:

- `apps/web/src/backend/modules/scgs/tests/integration/supabase-replay-store.test.ts`
- `apps/web/src/backend/modules/scgs/tests/integration/ci-decision.test.ts`
- `apps/web/src/backend/modules/scgs/tests/integration/prr.test.ts`
- `apps/web/src/backend/modules/scgs/tests/unit/replay-store.factory.test.ts`

Updated tests:

- `tests/integration/middleware-and-types/scgs-replay.test.ts` — verify storage round-trip.
- `tests/integration/scgs/validate-replay.test.ts` — align with real artifacts if feasible.

### 2.8 Documentation

- Update `apps/web/src/backend/modules/scgs/README.md` with governance and CI sections.
- Update `docs/specifications/scgs-compiler-pipeline.md` with replay storage and CI gate sections.
- Update `governance/planning/session-checkpoint.md` to mark Phase 6 in progress / completed.

---

## 3. Data Storage Design

### Supabase Storage

Bucket: `scgs-replay-traces`

Object key pattern: `{environment}/{lineageId}/{eventTimestamp}-{checksum}.jsonl`

Metadata: `lineageId`, `categoryId`, `environment`, `gitCommit`, `triggeredBy`.

### Artifact storage

For CI decision and PRR snapshot integrity, compiled artifacts must be persisted. Use the same bucket under `scgs-artifacts/` with key `{environment}/{lineageId}.json`.

For local dev, the filesystem adapter continues to use `governance/scgs/replay/` and `governance/scgs/artifacts/`.

---

## 4. Verification Commands

During development, run per deliverable:

```bash
# After domain / application changes
cd apps/web && pnpm typecheck

# After script changes
pnpm lint --cache

# Module tests
pnpm vitest run apps/web/src/backend/modules/scgs/tests/

# SCGS scripts
pnpm scgs:ci:decide
pnpm scgs:prr
pnpm scgs:replay:validate

# Delivery manifest
pnpm delivery:manifest:validate
```

Final PR verification:

```bash
pnpm install
pnpm lint --cache
pnpm typecheck
pnpm vitest run apps/web/src/backend/modules/scgs/tests/ tests/integration/middleware-and-types/scgs-replay.test.ts tests/integration/scgs/scgs-ranking-resurrection.test.tsx
pnpm delivery:manifest:validate
pnpm scgs:prr
```

---

## 5. Risks and Mitigations

| Risk                                                         | Mitigation                                                                          |
| ------------------------------------------------------------ | ----------------------------------------------------------------------------------- |
| Supabase Storage bucket does not exist in staging/production | Add creation to deployment runbook; script falls back to filesystem with a warning. |
| CI decision blocks all builds during initial rollout         | Use `continue-on-error: true` on the new job for the first merges.                  |
| PRR determinism is flaky due to timestamps                   | Normalize timestamps in artifacts before comparison; use lineage checksums.         |
| Replay storage migration leaves orphaned local traces        | Local adapter remains default for dev; only CI uses Supabase Storage.               |
| Governance controller thresholds are too strict              | Keep `DEFAULT_POLICY` permissive (`WARN` by default); tighten after baseline.       |
| GitHub Actions billing blocks CI                             | Continue local verification and `--admin` merge until billing is resolved.          |

---

## 6. Contingency Plans

### 6.1 Supabase Storage bucket does not exist or is unreachable

**Detection:**

- `scgs:ci:decide` / `scgs:prr` logs a warning when Supabase Storage returns 404 or network error.
- Fallback adapter logs: `SCGS_REPLAY_FALLBACK=filesystem`.

**Immediate response:**

1. Script continues using filesystem adapter (`governance/scgs/replay/`, `governance/scgs/artifacts/`).
2. CI decision still completes; no build block due to storage unavailability.
3. Dashboard read-model falls back to local traces on dev; on CI it reads the workspace checkout.

**Recovery:**

1. Create bucket `scgs-replay-traces` in Supabase Dashboard or via CLI:
   ```bash
   supabase storage create scgs-replay-traces --public false
   ```
2. Add RLS policy allowing service role full access.
3. Add bucket name and path prefix to GitHub environment variables:
   - `SCGS_STORAGE_BUCKET=scgs-replay-traces`
   - `SCGS_STORAGE_PATH_PREFIX=ci`
4. Re-run `pnpm scgs:ci:decide` on the next push; verify logs show `SCGS_REPLAY_STORE=supabase`.
5. Backfill missing historical traces only if needed (optional; Phase 6 does not require historical data).

**Prevention:**

- Add `supabase/migrations/` bucket creation migration if the project supports storage in migrations.
- Document bucket creation in `docs/operations/scgs-runbook.md`.

### 6.2 CI gate blocks all builds

**Detection:**

- `scgs-governance` job fails with exit code ≠ 0.
- Merge queue or PR checks turn red despite tests passing.

**Immediate response (already configured):**

1. Job uses `continue-on-error: true`, so the workflow still reports success.
2. Failure is visible in job logs but does not block merge.

**If the gate starts failing after we remove `continue-on-error: true`:**

1. **Revert to warning mode:** open a hotfix PR adding `continue-on-error: true` back to the job.
2. **Diagnose locally:** run the same command that failed in CI:
   ```bash
   pnpm scgs:ci:decide
   pnpm scgs:prr
   ```
3. **Common causes and fixes:**
   - **Baseline artifact missing** → seed a baseline artifact manually or disable snapshot-integrity check until baseline exists.
   - **Threshold too strict** → relax `DEFAULT_POLICY` thresholds (e.g., change `driftScore > 5` to `> 10` for `BLOCK`).
   - **Determinism flaky due to timestamps** → normalize timestamps in artifacts before comparison.
   - **Missing secrets** → verify `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are available in repository/environment secrets.
4. **Emergency bypass:** if the gate must be skipped entirely, the job can be disabled with:
   ```yaml
   if: false
   ```
   This requires a PR and merge to `develop`.

**Prevention:**

- Keep `continue-on-error: true` for at least 5–10 merges after Phase 6 lands.
- Monitor SCGS governance job logs before removing the flag.
- Add a dry-run mode (`--dry-run`) to `scgs:ci:decide` that reports but never fails.

## 7. Approval Checklist

- [ ] Scope and boundaries are acceptable.
- [ ] Supabase Storage is the preferred durable store.
- [ ] CI gate starts as `continue-on-error: true`.
- [ ] Contingency plans for storage and CI gate are acceptable.
- [ ] One PR for the entire phase is acceptable.

**Next action after approval:** Create branch `feat/scgs-phase-6-governance-ci-integration`, update the session checkpoint, and begin with §2.1 domain ports.
