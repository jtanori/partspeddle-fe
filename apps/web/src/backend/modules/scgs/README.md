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
│   ├── governance-policy.ts
│   ├── pts.ts
│   ├── semantic-specification.ts
│   └── replay/
│       ├── engine.ts
│       ├── store.ts
│       ├── types.ts
│       └── validator.ts
├── application/               # Use cases / projections
│   ├── build-dashboard-read-model.ts
│   ├── compile-listing.ts
│   └── rank-artifacts.ts
├── infrastructure/            # I/O, repositories, controllers
│   ├── governance-controller.ts
│   ├── ranking-engine.ts
│   ├── ranking-types.ts
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
