# SCGS — Semantic Compiler & Governance System

Canonical backend module for PartsPeddle's semantic specification layer.

## Purpose

SCGS compiles raw listing specifications into a normalized, ranked, and
governed semantic artifact. It provides:

- **Specification compilation** — flattening and grouping category specs into a
  canonical artifact.
- **Lineage tracking** — content-addressable `lineageId` and `checksum` for
  every compiled artifact.
- **Semantic diff & evolution tracking** — detecting breaking vs. safe changes.
- **Policy governance** — enforcing approval rules for schema drift.
- **PTS (Platform Trust Score)** — quantifying semantic drift.
- **Replay & lineage** — reconstructing how an artifact changed over time.
- **Ranking signals** — feeding marketplace search ranking with quality scores.

## Module layout (canonical)

```
apps/web/src/backend/modules/scgs/
├── domain/                    # Pure domain logic, zero infra dependencies
│   ├── compiled-specification-set.ts
│   ├── compiled-semantic-artifact.ts
│   ├── diff.ts
│   ├── governance/            # CI decision and PRR report types
│   │   ├── ci-decision.ts
│   │   └── prr-report.ts
│   ├── governance-policy.ts
│   ├── pts.ts
│   ├── semantic-specification.ts
│   └── replay/
│       ├── engine.ts
│       ├── replay-store.port.ts
│       ├── store.ts           # backward-compatible re-export
│       ├── types.ts
│       └── validator.ts
├── application/               # Use cases / projections
│   ├── build-dashboard-read-model.ts
│   ├── compile-listing.ts
│   ├── evaluate-governance.ts
│   ├── rank-artifacts.ts
│   ├── replay-trace.ts
│   └── run-prr.ts
├── infrastructure/            # I/O, repositories, controllers
│   ├── governance-controller.ts
│   ├── ranking-engine.ts
│   ├── ranking-types.ts
│   ├── replay/                # storage adapters
│   │   ├── filesystem-replay-store.ts
│   │   ├── supabase-replay-store.ts
│   │   └── replay-store.factory.ts
│   └── specification-compiler.ts
├── tests/                     # Module-owned tests
├── index.ts                   # Public barrel
└── README.md
```

## Public API

Import everything through the module barrel:

```ts
import {
  compileListing,
  rankArtifacts,
  SpecificationCompilerImpl,
  RankingEngine,
  SemanticReplayEngine,
  buildDashboardReadModel,
  type CompiledSemanticArtifact,
  type CompiledSpecificationSet,
  type LineageId,
  type RankedArtifact,
} from '@/backend/modules/scgs';
```

## Dependencies

The module depends on repository interfaces defined in:

- `@/repositories/specification.repository`
- `@/repositories/catalog.repository`
- `@/repositories/listing.repository`

These are injected into `SpecificationCompilerImpl` and the `compileListing` use
case.

## Backward compatibility

Temporary shims remain in the legacy locations:

- `apps/web/src/domain/specification/scgs/*`
- `apps/web/src/domain/services/specification.compiler.ts`

They re-export the canonical module. New code must use `@/backend/modules/scgs`.
The shims will be removed in a future cleanup pass.

## Governance & CI (Phase 6)

SCGS now provides real governance gates:

- **`evaluateGovernanceDecision`** — combines PTS drift, governance policy, and
  system state into a `PASS | WARN | BLOCK` CI decision.
- **`replayTrace`** — generates, persists, and validates a replay trace between
  two compiled artifacts.
- **`runPRR`** — runs the Production Readiness Review checks:
  - Determinism
  - PTS stability
  - Snapshot integrity
  - PTS contract integrity
- **`createReplayStore`** — environment-based factory that selects a filesystem
  adapter (dev/local) or Supabase Storage adapter (CI/production).

### Scripts

```bash
# CI gate — exits 0/1/2 for PASS/WARN/BLOCK
pnpm scgs:ci:decide

# Production Readiness Review
pnpm scgs:prr

# Replay validation against stored trace
TRACE_ID=... SCGS_PREVIOUS_ARTIFACT_URI=... SCGS_CURRENT_ARTIFACT_URI=... pnpm scgs:replay:validate
```

### CI workflow

`.github/workflows/ci.yml` includes an `scgs-governance` job after the `test`
job. The job starts with `continue-on-error: true` while the baseline is
established.

### Storage configuration

| Variable                    | Purpose                             |
| --------------------------- | ----------------------------------- |
| `SCGS_REPLAY_STORE`         | `filesystem` or `supabase`          |
| `SCGS_STORAGE_BUCKET`       | Supabase Storage bucket name        |
| `SCGS_STORAGE_PATH_PREFIX`  | Prefix for stored objects           |
| `SUPABASE_URL`              | Supabase project URL                |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key for storage writes |

## Ranking signals

The ranking engine consumes the following normalized signals:

- `listingQuality` (0.30)
- `sellerTrust` (0.20)
- `recency` (0.15)
- `imageQuality` (0.10)
- `inventoryCompleteness` (0.10)
- `popularity` (0.08)
- `responseRate` (0.04)
- `conversionScore` (0.03)

Each contribution includes a `normalizedValue` and human-readable `explanation`.

## Testing

Run module-owned tests:

```bash
pnpm vitest run apps/web/src/backend/modules/scgs/tests/ranking-engine.test.ts
pnpm vitest run apps/web/src/backend/modules/scgs/tests/rank-artifacts.test.ts
pnpm vitest run apps/web/src/backend/modules/scgs/tests/compile-listing.test.ts
pnpm vitest run apps/web/src/backend/modules/scgs/tests/lineage.test.ts
```

Run integration/certification tests:

```bash
pnpm vitest run tests/certification/ranking-engine.test.ts
pnpm vitest run tests/integration/middleware-and-types/scgs-replay.test.ts
pnpm vitest run tests/integration/scgs/scgs-ranking-resurrection.test.ts
pnpm vitest run tests/certification/c08_specification_parity.test.ts
pnpm vitest run tests/integration/middleware-and-types/pdp-projection.test.ts
```
