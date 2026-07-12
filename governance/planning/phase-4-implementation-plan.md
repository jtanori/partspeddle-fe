# Phase 4 — Platform Consolidation

**Status:** Implementation plan — awaiting approval.  
**Goal:** Move engineering tooling, operational scripts, deployment configs, and build assets under `platform/` while keeping the application deployable.

---

## Context

Phases 0–3 established the platform-repository direction:

- Phase 0: navigation documents at root (`PROJECT_MAP.md`, `ARCHITECTURE.md`, etc.).
- Phase 1: pnpm workspace scaffolding, including empty `platform/` directories.
- Phase 2: Next.js application moved to `apps/web/`.
- Phase 3: repository and AI service code modularized under `apps/web/src/backend/modules/`.

The repository still has several engineering-platform subsystems living at root:

- `scripts/`
- `operations/`
- `fly/`
- `Dockerfile`
- `.dockerignore`
- lint-staged config in `package.json`
- `.husky/` hook scripts

This phase consolidates those under `platform/`.

---

## Constraints and non-negotiables

1. **`.github/workflows/` must stay at root.** GitHub only discovers workflow files under `.github/workflows/`. We will keep thin workflow files there and move reusable scripts/helpers to `platform/ci/`.
2. **Deployments must not break.** `flyctl deploy` must still build and deploy `apps/web/` correctly. We will validate the moved `Dockerfile` and `fly.toml` paths with a staging build-only deploy before merging.
3. **Husky hooks remain in `.husky/`.** Git requires hooks in `.git/hooks`; husky manages them from `.husky/`. We can, however, make `.husky/` hook scripts delegate to `platform/tooling/` and move lint-staged config out of `package.json`.
4. **Backward compatibility.** Any external references in docs, CI, or scripts are updated in the same PR.

---

## Target layout after this phase

```text
/
├── .github/
│   └── workflows/
│       ├── ci.yml                 # thin orchestrator, references platform/ci/
│       └── nightly-operational-validation.yml
│
├── platform/
│   ├── README.md
│   ├── scripts/
│   │   ├── README.md
│   │   ├── algolia/               # Algolia index configuration
│   │   ├── archive/               # one-off / historical scripts
│   │   ├── bootstrap/             # seed scripts
│   │   ├── ci/                    # CI helpers (smoke tests, etc.)
│   │   ├── deployment/            # deploy.sh and related helpers
│   │   ├── dev/                   # local development helpers
│   │   ├── generators/            # code generators
│   │   ├── maintenance/           # archive, cleanup, drift checks
│   │   ├── migration/             # database migration helpers
│   │   ├── scgs/                  # SCGS certification scripts
│   │   ├── search/                # search-specific scripts
│   │   └── security/              # security audit / env-check scripts
│   │
│   ├── operations/
│   │   ├── README.md
│   │   ├── delivery/              # branches.json, manifests, recovery
│   │   ├── deployment/            # fly, github, supabase placeholders
│   │   ├── environment/           # env schemas / docs
│   │   └── kernel/                # operational kernel docs
│   │
│   ├── ci/
│   │   ├── README.md
│   │   └── helpers/               # reusable shell / ts scripts used by workflows
│   │
│   ├── deployment/
│   │   ├── README.md
│   │   └── fly/
│   │       ├── fly.stage.toml
│   │       └── fly.prod.toml
│   │
│   ├── docker/
│   │   ├── README.md
│   │   ├── Dockerfile
│   │   └── .dockerignore
│   │
│   ├── generators/
│   │   └── README.md              # already exists; unchanged
│   │
│   └── tooling/
│       ├── README.md
│       ├── lint-staged.config.js  # extracted from package.json
│       ├── pre-commit.sh          # delegated from .husky/pre-commit
│       └── commit-msg.sh          # delegated from .husky/commit-msg
│
├── scripts/                       # removed (moved to platform/scripts/)
├── operations/                    # removed (moved to platform/operations/)
├── fly/                           # removed (moved to platform/deployment/fly/)
├── Dockerfile                     # removed (moved to platform/docker/Dockerfile)
└── .dockerignore                  # kept at root as a thin pointer, or removed if docker build context uses platform/docker/
```

---

## Detailed work

### 1. Move `scripts/` → `platform/scripts/`

Current directories → new homes:

| Current | New | Rationale |
|---|---|---|
| `scripts/algolia/` | `platform/scripts/algolia/` | Algolia configuration scripts. |
| `scripts/archive/` | `platform/scripts/archive/` | Historical / one-off scripts. |
| `scripts/ci/` | `platform/scripts/ci/` | CI-specific helpers (e.g., `smoke-staging.ts`). |
| `scripts/db/` | `platform/scripts/migration/` | Database migration / drift helpers. |
| `scripts/debug/` | `platform/scripts/dev/` | Local debug helpers. |
| `scripts/ops/` | `platform/scripts/deployment/` | Deployment, verification, and env validation scripts. |
| `scripts/scgs/` | `platform/scripts/scgs/` | SCGS certification scripts. |
| `scripts/search/` | `platform/scripts/search/` | Search worker / audit scripts. |
| `scripts/security/` | `platform/scripts/security/` | Bundle audit, env-check. |
| `scripts/seed/` | `platform/scripts/bootstrap/` | Seed scripts. |
| `scripts/tools/` | `platform/scripts/tooling/` | Tooling helpers (eslint formatter). |

**Updates required:**

- `package.json` scripts: every `tsx scripts/...` path updated to `tsx platform/scripts/...`.
- `eslint.config.js` in `packages/config`: lint target changes from `scripts` to `platform/scripts`.
- Internal script cross-references (e.g., `scripts/ops/deploy.sh` referencing `fly/`).
- `docs/` references to script paths.
- `tests/branch/` tests that assert script paths.

### 2. Move `operations/` → `platform/operations/`

Move the entire `operations/` tree to `platform/operations/`.

**Updates required:**

- `.github/workflows/ci.yml`: `operations/delivery/branches.json` → `platform/operations/delivery/branches.json`.
- `scripts/ops/validate-delivery-manifest.ts` and related scripts.
- `docs/operations/` internal links.
- Any tests asserting `operations/` paths.

### 3. Move `fly/` → `platform/deployment/fly/`

Move `fly.stage.toml` and `fly.prod.toml` to `platform/deployment/fly/`.

**Updates required:**

- `package.json` deploy scripts:
  - `deploy:staging`: `flyctl deploy --config platform/deployment/fly/fly.stage.toml`
  - `deploy:production`: `flyctl deploy --config platform/deployment/fly/fly.prod.toml`
- `scripts/ops/deploy.sh` (now `platform/scripts/deployment/deploy.sh`): update `CONFIG=...` paths.
- `fly.toml` files: update comments and any internal path references.

### 4. Move `Dockerfile` and `.dockerignore` → `platform/docker/`

Move `Dockerfile` to `platform/docker/Dockerfile`. Move `.dockerignore` to `platform/docker/.dockerignore` and keep a root `.dockerignore` that points to it or delegates, depending on what Fly's build context expects.

**Critical validation:**

- Run `flyctl deploy --config platform/deployment/fly/fly.stage.toml --build-only` (requires Fly auth) to confirm the build context resolves the Dockerfile and ignore file.
- If Fly uses the fly.toml directory as the build context, we will adjust by either:
  - keeping `.dockerignore` at root, or
  - adding a root `Dockerfile` that `COPY`s from `platform/docker/Dockerfile` (not ideal), or
  - configuring `dockerfile` path in `fly.toml` and validating context behavior.

The PR description will explicitly note this validation step.

### 5. Extract lint-staged and husky configs to `platform/tooling/`

- Create `platform/tooling/lint-staged.config.js` containing the current lint-staged configuration.
- Update `package.json` to reference it: `"lint-staged": "platform/tooling/lint-staged.config.js"` (lint-staged supports a path in package.json or via `.lintstagedrc`).
- Create `platform/tooling/pre-commit.sh` and `platform/tooling/commit-msg.sh`.
- Update `.husky/pre-commit` to `bash platform/tooling/pre-commit.sh`.
- Update `.husky/commit-msg` to `bash platform/tooling/commit-msg.sh`.

### 6. Create `platform/ci/` helpers

Move any CI-specific reusable logic from `.github/workflows/` into `platform/ci/helpers/` if appropriate. For this phase, the primary change is:

- Create `platform/ci/README.md` documenting the thin-workflow pattern.
- Optionally extract long shell blocks from `ci.yml` into `platform/ci/helpers/` scripts if it improves readability.

The workflow files stay in `.github/workflows/`.

### 7. Update direct consumers

Files known to reference old paths:

- `package.json` (all script paths)
- `packages/config/eslint.config.js`
- `.github/workflows/ci.yml`
- `apps/web/src/app/api/health/route.ts` (check for script references)
- `docs/` (multiple files)
- `tests/branch/p2-11-root-cleanup/root-cleanup.test.tsx`
- `tests/branch/p4-exercise-cicd/exercise-cicd.test.ts`
- `tests/branch/p5-deploy-env-review/deploy-env-review.test.tsx`
- `tests/branch/p2-health-check/health-check.test.ts`

### 8. Update documentation

- Update `docs/operations/deployment-observability.md` with new artifact/script paths.
- Update `docs/DEPLOYMENT_RUNBOOK.md` with new deploy script and fly.toml paths.
- Update `docs/FLYIO_INFRASTRUCTURE.md` with new Dockerfile/fly.toml paths.
- Update `platform/scripts/README.md` with the new taxonomy.
- Update `PROJECT_MAP.md` if it lists root-level `scripts/` or `operations/`.

### 9. Verification plan

Run the following scoped checks locally before opening the PR:

```bash
pnpm install
pnpm lint
pnpm typecheck
pnpm test tests/branch/p2-11-root-cleanup tests/branch/p4-exercise-cicd tests/branch/p5-deploy-env-review tests/branch/p2-health-check
pnpm build
pnpm storybook:build
pnpm delivery:manifest:validate
```

If Fly auth is available, also run:

```bash
flyctl deploy --config platform/deployment/fly/fly.stage.toml --build-only
```

---

## Acceptance criteria

- [ ] `platform/scripts/` contains all former `scripts/` content organized by purpose.
- [ ] `platform/operations/` contains the former `operations/` content.
- [ ] `platform/deployment/fly/` contains the former `fly/` content.
- [ ] `platform/docker/` contains `Dockerfile` and `.dockerignore`.
- [ ] `package.json` scripts reference `platform/scripts/...` paths.
- [ ] `.github/workflows/ci.yml` references new paths for delivery config and scripts.
- [ ] `pnpm lint`, `pnpm typecheck`, `pnpm build`, and scoped tests pass.
- [ ] CI passes on the PR.
- [ ] Documentation reflects the new platform layout.

---

## Risks and mitigations

| Risk | Mitigation |
|---|---|
| Missing a script path reference in `package.json` or CI. | Grep for `scripts/`, `operations/`, `fly/`, `Dockerfile` after changes; run full local verification. |
| Fly build context cannot find Dockerfile after move. | Validate with `flyctl deploy --build-only` before merge; keep root `.dockerignore` fallback if needed. |
| Husky hooks break after config move. | Test a local commit (or run hook scripts manually) after extracting lint-staged config. |
| Branch / CI tests assert old root paths. | Run the branch tests listed in verification plan and update assertions. |
| Merge conflicts with in-flight feature branches. | Coordinate with operator; keep moves mechanical and well-scoped. |

---

## Out of scope

- Moving `.github/workflows/` files themselves (GitHub requirement).
- Moving `.husky/` directory itself (Git/husky requirement), but delegating hook content.
- Moving `docs/`, `governance/scgs/`, `governance/planning/`, or `tests/` (those are Phases 5–7).
- Renaming or refactoring script logic — only paths change.
