# Engineering Manual — PartsPeddle / VinTrack

**Purpose:** A single entry point for engineers, operators, and agents who need to understand how PartsPeddle is built, governed, and operated.

**How to use this manual:** Read Parts I–IV for orientation, then jump to the section that matches your current task. Authoritative documents are linked throughout; this manual is the table of contents, not the source of truth for every detail.

---

## Part I — Welcome

PartsPeddle / VinTrack is an AI-native automotive-parts marketplace. The repository is evolving from a single Next.js application into a **platform repository**: application code, shared packages, backend modules, governance artifacts, and operational tooling live in distinct top-level domains.

This manual explains:

- How the architecture is organized and where it is heading.
- What the governance subsystems do and how they interact.
- How to develop, test, deploy, and operate the system.
- Which documents are authoritative for each kind of decision.

If you are brand new, read this file once, then follow the links.

---

## Part II — Repository at a Glance

Current topology:

```text
partspeddle-fe/
├── apps/web/                 # Next.js application
├── packages/                 # Shared configuration
├── tests/                    # Test taxonomy
├── docs/                     # Knowledge base
├── platform/                 # CI, deployment, scripts, tooling
├── supabase/                 # Migrations, edge functions, config
├── governance/               # Planning, SCGS, certification, decisions
├── config/                   # Shared configuration (EGS, environment)
└── artifacts/                # Deployment artifacts and reports
```

Target topology (in progress):

```text
partspeddle-fe/
├── apps/web/
├── packages/
├── backend/modules/          # Modular monolith
├── platform/
├── governance/
├── docs/
├── tests/
└── artifacts/
```

The migration is tracked in `governance/planning/platform-repository-evolution.md`.

Canonical files you should know:

| File | Why it matters |
| ---- | -------------- |
| `PROJECT_MAP.md` | Repository table of contents. |
| `ARCHITECTURE.md` | High-level architecture and convergence target. |
| `CONTRIBUTING.md` | Branch model, commits, verification commands. |
| `TESTING.md` | Test taxonomy and how to run tests. |
| `AGENTS.md` | Rules for agent-assisted work. |
| `GOVERNANCE.md` | Glossary and interaction map for governance subsystems. |
| `config/environment/schema.ts` | Single source of truth for environment variables. |
| `platform/operations/delivery/manifests/delivery.manifest.json` | Canonical delivery descriptor. |

---

## Part III — Architecture

### Guiding principle

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

### Three architectural generations

The repository currently contains three overlapping styles. This is a record of evolution, not a defect.

**Generation 1 — Service and repository layer**

- Locations: `src/services/`, `src/repositories/`, `src/lib/`
- Business logic lives in service functions; repositories abstract data access.
- Still appropriate for cross-cutting utilities and one-off scripts.

**Generation 2 — Domain-driven shapes**

- Locations: `src/domain/`, `src/projection/`, `src/view-models/`
- Domain types and rules are separated from UI types; projections are read models for pages.
- Still appropriate for page-level read models and shared domain concepts.

**Generation 3 — Backend modules**

- Location: `src/backend/modules/search/`
- Each module is a bounded context with clear layers.
- **This is the canonical architecture for all new backend work.**

```text
src/backend/modules/<name>/
├── application/          # Use cases and command/query handlers
├── contract/             # Operational contracts
├── domain/               # Domain entities, value objects, policies
├── infrastructure/       # External clients and repository adapters
├── observability/        # Metrics and tracing
├── performance/          # Benchmarks
├── resilience/           # Circuit breakers, retries
└── tests/
    ├── contract/
    ├── integration/
    ├── observability/
    ├── performance/
    └── resilience/
```

### Application layer

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

### Infrastructure at runtime

- **Fly.io** — application hosting (`vintrack-stage`, `vintrack-prod`).
- **Supabase** — Postgres, auth, edge functions, realtime.
- **Algolia** — search index and query engine.
- **GitHub Actions** — CI/CD pipeline.

For deeper reading:

- `ARCHITECTURE.md`
- `docs/engineering/next-app-router-architecture.md`
- `src/backend/modules/search/`

---

## Part IV — Governance Ecosystem

PartsPeddle uses several governance concepts. They exist because the project is moving from a simple application to an operationally certified platform.

| Subsystem | Purpose | Authoritative Location |
| --------- | ------- | ---------------------- |
| **Planning** | Decides what to build and when. | `governance/planning/` |
| **Architecture** | Decides how to structure it. | `ARCHITECTURE.md`, ADRs in `governance/decisions/` |
| **SCGS** | Semantic Change Governance System — compile-time analysis, replay, ranking telemetry. | `governance/scgs/` |
| **PRC** | Production Readiness Certification — gate before promotion. | `docs/guides/prc.md` |
| **PTS** | Production Test Specification — tests required for production readiness. | Embedded in `docs/guides/prc.md` and `tests/certification/` |
| **PRR** | Pre-Release Review — structured human review before promotion. | `docs/review-templates/` |
| **DC** | Delivery Certification — CI/CD, deployment, health, and smoke gates. | `docs/operations/delivery-audit.md`, `artifacts/delivery/` |
| **EGS** | Engineering Governance System — constitutions and policies. | `governance/` |
| **TMIG** | Technical Migration Governance — tracks multi-subsystem migrations. | Planning documents and ADRs |
| **Contracts** | Operational guarantees between subsystems. | `platform/operations/delivery/manifests/delivery.manifest.json`, module `contract/` directories |
| **Replay** | Re-run historical inputs through changed code to prove behavior is preserved. | `governance/scgs/replay/`, `platform/scripts/scgs/replay-validate.ts` |

### How governance interacts in a release

```text
Planning (governance/planning/)
  ↓
Implementation (src/)
  ↓
SCGS analysis + PTS score (governance/scgs/)
  ↓
Test & certification (tests/, docs/guides/prc.md)
  ↓
PRR / PTS review
  ↓
Delivery (platform/operations/delivery/manifests/delivery.manifest.json)
  ↓
Deployment (GitHub Actions, Fly.io, Supabase)
  ↓
Observability & artifacts (artifacts/delivery/)
```

Not every change triggers every gate. A small bug fix goes through tests and PR review. A large refactor also triggers SCGS replay and certification evidence updates.

### Authority map

| Decision type | Canonical source |
| ------------- | ---------------- |
| What to build next | `governance/planning/platform-repository-evolution.md` |
| How to structure code | `ARCHITECTURE.md` + `src/backend/modules/search/` |
| Is it production ready? | `docs/guides/prc.md` + `docs/operations/delivery-audit.md` |
| Where do secrets go? | `docs/operations/secret-governance.md` |
| How to deploy | `docs/operations/deployment-runbook.md` + `platform/operations/delivery/manifests/delivery.manifest.json` |
| What tests must pass | `TESTING.md` + `tests/certification/` |
| Agent rules | `AGENTS.md` |

For deeper reading: `GOVERNANCE.md`.

---

## Part V — Development Workflow

### Branch model

```text
main                     # production
  ↑
develop                  # staging / integration
  ↑
feat/<name>              # features
fix/<name>               # bug fixes
docs/<name>              # documentation
ci-test/<name>           # pipeline validation branches
```

- Create feature branches from `develop`.
- Open a PR back to `develop`.
- Production releases are promoted via `develop → main` PRs.

### Commit conventions

This repository uses [Conventional Commits](https://www.conventionalcommits.org/):

```text
feat: add seller inventory export
fix: resolve Algolia pagination off-by-one
docs: update deployment runbook
test: add CSP nonce assertion
refactor: move catalog types into backend module
chore: upgrade eslint
```

### Verification before PR

Run at least these commands before opening a PR:

```bash
pnpm lint --cache
pnpm typecheck
pnpm test
```

For focused changes, run the relevant subset:

```bash
pnpm vitest run tests/unit/path/to/file.test.ts
pnpm vitest run tests/integration/path/to/file.test.ts
pnpm vitest run tests/governance/path/to/file.test.ts
```

For deployment-related changes, also run:

```bash
pnpm delivery:manifest:validate
```

### Agent-assisted work

If you are working with an AI agent, read `AGENTS.md` first. It defines verification rules, git workflow, and what the agent may do autonomously.

For deeper reading: `CONTRIBUTING.md`.

---

## Part VI — Testing Philosophy

Tests are organized by intent, not by file type.

| Directory | Intent | Example |
| --------- | ------ | ------- |
| `tests/unit/` | Fast, isolated pure logic. | Domain rules, view-model builders |
| `tests/integration/` | Cross-subsystem behavior. | API routes, repositories, modules, UI wiring |
| `tests/e2e/` | Browser smoke tests. | Playwright critical journeys |
| `tests/certification/` | Compliance and certification gates. | PRC/DC automated checks |
| `tests/governance/` | Security, architecture, policy. | CSP tests, drift checks |
| `tests/performance/` | Resilience, chaos, load. | Benchmarks, circuit-breaker behavior |
| `tests/regression/` | Backward compatibility. | Layout audits, semantic parity |

Canonical backend modules keep their tests inside the module:

```text
src/backend/modules/search/tests/
├── contract/
├── integration/
├── observability/
├── performance/
└── resilience/
```

Run the default suite:

```bash
pnpm test
```

Run a single file:

```bash
pnpm vitest run tests/governance/environment/verify-environment-drift.test.ts
```

For deeper reading: `TESTING.md`.

---

## Part VII — Deployment & Operations

### Environments

| Environment | URL | App | How it is deployed |
| ----------- | --- | --- | ------------------ |
| Local | `http://localhost:3000` | — | `pnpm dev` |
| Staging | `https://stage.partspeddle.com` | `vintrack-stage` | Push to `develop` |
| Production | `https://partspeddle.com` | `vintrack-prod` | Merge to `main` |

### Delivery pipeline

```text
git push develop
  → GitHub Actions: test, configure
    → deploy-fly: flyctl deploy --config platform/deployment/fly/fly.stage.toml
    → deploy-supabase: supabase login, link, db push, functions deploy
    → smoke-tests: env validate, deploy verify, assert health contract, smoke tests
```

The production path is identical but triggered by `push` to `main` and targets the `production` environment.

### Operational commands

| Command | Purpose |
| ------- | ------- |
| `pnpm delivery:verify:env-drift --env staging` | Compare Fly/GitHub secrets against the schema. |
| `pnpm delivery:verify:production-access` | Verify local Fly access to production without deploying. |
| `pnpm deploy:verify <url>` | Poll health endpoint until checks pass. |
| `pnpm deploy:assert-contract <url>` | Validate health contract version. |
| `pnpm env:validate` | Validate runtime environment variables. |

### Secret governance

- Runtime secrets live in Fly.io (`fly secrets set`).
- CI/deploy secrets live in GitHub environments (`staging` / `production`).
- Local values live in `.env.local` and are never committed.

For the full policy: `docs/operations/secret-governance.md`.

For manual procedures: `docs/operations/deployment-runbook.md`.

---

## Part VIII — Security & Compliance

### Content Security Policy

Production uses a **nonce-based CSP** generated per request in `src/proxy.ts`. Inline scripts must carry the request nonce. The temporary `'unsafe-inline'` relaxation has been removed.

### Secret handling

- Never commit secrets.
- Never log secrets.
- Never embed secrets in client bundles.
- Use `config/environment/schema.ts` to declare variables and their provider.

### Security baselines

- `docs/engineering/security.md` — CSP and application security.
- `docs/engineering/api-security.md` — API security baseline.
- `docs/operations/secret-governance.md` — secret storage policy.
- `tests/governance/security/` — automated security invariants.

---

## Part IX — Common Tasks

### Start the app locally

```bash
pnpm install
cp .env.example .env.local
# fill in .env.local
pnpm dev
```

### Add a new backend module

Mirror `src/backend/modules/search/`:

```text
src/backend/modules/<name>/
├── application/
├── domain/
├── infrastructure/
├── tests/
└── contract/
```

### Add a new page

- Place the page in `src/app/(group)/`.
- Add a projection if the page needs a tailored read model.
- Keep API routes thin; delegate to application services.

### Add a new test

1. Choose the directory that matches intent (`tests/unit/`, `tests/integration/`, `tests/governance/`, etc.).
2. Create a descriptive file ending in `.test.ts` or `.spec.ts`.
3. Run the single file first:

   ```bash
   pnpm vitest run path/to/your.test.ts
   ```

### Run a production access check

```bash
pnpm delivery:verify:production-access
```

### Run an environment drift check

```bash
pnpm delivery:verify:env-drift --env staging
pnpm delivery:verify:env-drift --env production
```

### Open and merge a PR

1. Push your branch to origin.
2. Open a PR against `develop`.
3. Fill in the description with what changed, why, and verification commands.
4. If CI is blocked by GitHub billing, the PR may be merged with `--admin` after local verification passes.

---

## Part X — Decision Records

Architecture decisions are recorded in:

- `governance/decisions/` — ADRs.
- `docs/decisions/` — decision index and lightweight records.

Propose a new decision by adding an ADR and opening a PR.

---

## Part XI — Glossary

| Term | Definition |
| ---- | ---------- |
| **Projection** | A read model optimized for a specific page or component. |
| **Bounded context** | A module or subsystem with its own domain model and ubiquitous language. |
| **Backend module** | A self-contained domain unit with application, domain, infrastructure, and test layers. |
| **PRC** | Production Readiness Certification. |
| **DC** | Delivery Certification. |
| **SCGS** | Semantic Change Governance System. |
| **PTS** | Production Test Specification. |
| **PRR** | Pre-Release Review. |
| **EGS** | Engineering Governance System. |
| **TMIG** | Technical Migration Governance. |
| **Drift** | Difference between the canonical schema and actual remote configuration. |
| **Artifact** | A generated record of a deployment or certification event. |
| **Contract** | An operational guarantee between subsystems (health, API, search sync, etc.). |

---

## Part XII — Index by Role

### New contributor

1. `docs/onboarding/ENGINEERING_MANUAL.md` (this file)
2. `docs/onboarding/getting-started.md`
3. `PROJECT_MAP.md`
4. `CONTRIBUTING.md`

### Backend engineer

1. `ARCHITECTURE.md`
2. `src/backend/modules/search/`
3. `docs/engineering/backend-modules.md`
4. `TESTING.md`

### Frontend engineer

1. `ARCHITECTURE.md`
2. `docs/engineering/next-app-router-architecture.md`
3. `src/app/` and `src/components/`
4. `TESTING.md`

### Operator / SRE

1. `docs/operations/deployment-runbook.md`
2. `docs/operations/delivery-audit.md`
3. `docs/operations/secret-governance.md`
4. `docs/operations/deployment-observability.md`

### Security engineer

1. `docs/engineering/security.md`
2. `docs/engineering/api-security.md`
3. `docs/operations/secret-governance.md`
4. `tests/governance/security/`

### Agent

1. `AGENTS.md`
2. `governance/planning/session-checkpoint.md`
3. `PROJECT_MAP.md`
4. `CONTRIBUTING.md`

---

## Related documents

- `PROJECT_MAP.md`
- `ARCHITECTURE.md`
- `CONTRIBUTING.md`
- `TESTING.md`
- `GOVERNANCE.md`
- `AGENTS.md`
- `docs/onboarding/getting-started.md`
