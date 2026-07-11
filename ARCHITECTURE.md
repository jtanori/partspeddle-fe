# Architecture — PartsPeddle / VinTrack

This document describes the high-level architecture of the repository, the three architectural generations that currently coexist, and the convergence target.

---

## Guiding principle

> The application layer consumes projections. Projections derive from domain models. Domain models are persisted and queried through infrastructure.

```text
UI / API
   ↓
Projection (read model)
   ↓
Application service / command handler
   ↓
Domain
   ↓
Infrastructure (repository, external client)
```

This direction is already visible in `src/projection/` and `src/backend/modules/search/`.

---

## Three architectural generations

The repository currently contains three overlapping styles. This is a record of evolution, not a defect.

### Generation 1 — Service and repository layer

**Locations:** `src/services/`, `src/repositories/`, `src/lib/`

**Characteristics:**

- Business logic lives in service functions.
- Repositories abstract data access (Supabase, Algolia).
- Types are grouped by domain in `src/types/`.

**Still appropriate for:**

- Cross-cutting utilities in `src/lib/`.
- One-off scripts and adapters.

**Migration path:** New features should not add to `src/services/` unless they are pure utilities. Existing services are migrated incrementally as they are touched.

### Generation 2 — Domain-driven shapes

**Locations:** `src/domain/`, `src/projection/`, `src/view-models/`

**Characteristics:**

- Domain types and rules are separated from UI types.
- Projections are read models tailored for specific pages.
- View-models adapt projections for components.

**Still appropriate for:**

- Page-level read models (`src/projection/search/`, `src/projection/pdp/`).
- Shared domain concepts that have not yet moved into a backend module.

**Migration path:** Domain types move into the appropriate `backend/modules/<domain>/domain/`. Projections stay near the UI layer.

### Generation 3 — Backend modules

**Locations:** `src/backend/modules/search/`

**Characteristics:**

- Each module is a bounded context.
- Clear layers: `application/`, `domain/`, `infrastructure/`, `tests/`, `contract/`.
- Owns its own types, commands, queries, and observability.

**This is the canonical architecture** for all new backend work.

**Reference module:**

```text
src/backend/modules/search/
├── application/          # Use cases and command/query handlers
├── contract/             # Operational contracts
├── domain/               # Domain entities, value objects, policies
├── infrastructure/       # Algolia client, repository adapters
├── observability/        # Metrics and tracing
├── performance/          # Benchmarks and load tests
├── resilience/           # Circuit breakers, retries
└── tests/
    ├── contract/
    ├── integration/
    ├── observability/
    ├── performance/
    └── resilience/
```

---

## Convergence target

All new backend development follows the search module pattern. Future modules will be added alongside it:

```text
backend/modules/
├── search/               # canonical reference
├── listing/
├── seller/
├── catalog/
├── taxonomy/
├── ai/
├── payments/             # when introduced
└── escrow/               # when introduced
```

The UI layer remains in `apps/web/` once Phase 1 of the platform evolution begins. Until then, it stays in `src/app/` and `src/components/`.

---

## Application layer

### Next.js App Router

- Server Components fetch projections or call backend modules directly.
- Client Components handle local state and user interactions.
- API routes are thin adapters over application services.

### Route structure

```text
src/app/
├── (public)/             # marketing, search, listing detail
├── (auth)/               # login, register
├── (dashboard)/          # buyer/seller dashboard
├── (seller)/             # seller workspace
├── (admin)/              # admin tools
└── api/                  # API routes
```

### API thinness

API routes should contain minimal logic. Preferred flow:

```text
Route
  ↓
Application service
  ↓
Command / Query
  ↓
Domain
  ↓
Repository / External client
```

---

## Data flow

### Search example

```text
User types query
  ↓
Search page (Server Component)
  ↓
Search projection
  ↓
Search application service
  ↓
Algolia client (infrastructure)
  ↓
Results returned as projection
  ↓
UI renders
```

### Listing detail example

```text
Request /listing/:id
  ↓
PDP projection
  ↓
Catalog repository
  ↓
Supabase
  ↓
Projection hydrated and rendered
```

---

## Projection layer

Projections are read models optimized for UI pages. They live in `src/projection/` today and will move to `apps/web/src/projection/` during platform extraction.

Current projections:

- `src/projection/search/` — search results, facets, filters.
- `src/projection/pdp/` — product detail page data.

Guidelines:

- A projection should match a page or a major component.
- Projections should not leak infrastructure details.
- New pages should consume projections rather than repositories.

---

## AI subsystem

AI capabilities are currently scattered (e.g., `src/services/ai-vision.ts`). The target is a dedicated backend module:

```text
backend/modules/ai/
├── vision/
├── embeddings/
├── ranking/
├── classification/
└── summarization/
```

This will be created when AI features expand beyond the current vision/ranking use cases.

---

## SCGS

SCGS (Semantic Change Governance System) is a cross-cutting governance layer. It currently spans:

- Compilation and AST analysis
- Governance policies
- Replay validation
- Ranking telemetry
- Diff engine

It lives in `.scgs/` today and will move to `governance/scgs/` during platform evolution. SCGS is treated as converging architecture, not a refactoring target.

---

## Infrastructure

### Runtime

- **Fly.io** — application hosting (`vintrack-stage`, `vintrack-prod`).
- **Supabase** — Postgres, auth, edge functions, realtime.
- **Algolia** — search index and query engine.
- **GitHub Actions** — CI/CD pipeline.

### Deployment

Deployment topology and verification are defined in:

- `operations/delivery/manifests/delivery.manifest.json`
- `docs/operations/delivery-audit.md`
- `docs/operations/deployment-observability.md`

---

## Related documents

- `PROJECT_MAP.md` — repository table of contents.
- `docs/NEXT_APP_ROUTER_ARCHITECTURE.md` — App Router-specific decisions.
- `.planning/platform-repository-evolution.md` — phased migration plan.
- `src/backend/modules/search/` — canonical module reference.
