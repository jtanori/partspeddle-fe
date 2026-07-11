# Contributing — PartsPeddle / VinTrack

This document describes how to contribute to the project. If you are unsure where something lives, start with `PROJECT_MAP.md`.

---

## Prerequisites

- [Node.js](https://nodejs.org/) >= 22
- [pnpm](https://pnpm.io/) >= 9
- [flyctl](https://fly.io/docs/flyctl/install/) (for deployments)

---

## Local setup

1. Install dependencies:

   ```bash
   pnpm install
   ```

2. Copy environment variables:

   ```bash
   cp .env.example .env.local
   ```

3. Fill in `.env.local` with your Supabase, Algolia, and Gemini credentials.

4. Run the dev server:

   ```bash
   pnpm dev
   ```

5. Open [http://localhost:3000](http://localhost:3000).

---

## Branch model

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
- Open a PR back to `develop` when ready.
- Production releases are promoted via `develop → main` PRs.

---

## Commit conventions

This repository uses [Conventional Commits](https://www.conventionalcommits.org/):

```text
feat: add seller inventory export
fix: resolve Algolia pagination off-by-one
docs: update deployment runbook
test: add CSP nonce assertion
refactor: move catalog types into backend module
chore: upgrade eslint
```

`lint-staged` runs on every commit:

- `*.{ts,tsx}` → `eslint --cache --fix` then `prettier --cache --write`
- `*.{json,md,css}` → `prettier --cache --write`

In CI, hooks are skipped with `HUSKY=0`.

---

## Verification before PR

Run at least these commands before opening a PR:

```bash
pnpm lint
pnpm typecheck
pnpm test
```

For focused changes, run the relevant subset:

```bash
pnpm test tests/security/headers.spec.ts
pnpm test tests/branch/p2-9-security-headers/security-headers.test.ts
```

For UI or page changes, also run:

```bash
pnpm build
```

For deployment-related changes, also run:

```bash
pnpm delivery:manifest:validate
```

---

## Opening a PR

1. Push your branch to origin.
2. Open a PR against `develop` (or `main` for hotfixes).
3. Fill in the PR description with:
   - What changed and why.
   - Verification commands you ran.
   - Links to planning docs if this is part of a larger initiative.
4. Ensure CI passes.
5. Request review.

---

## Agent-assisted work

If you are working with an AI agent, read `AGENTS.md` first. It defines what the agent can and cannot do, including verification rules and git workflow.

---

## Where to add code

### New UI

- Components → `src/components/` (future: `apps/web/src/components/` and `packages/ui/`).
- Page-specific logic → near the page in `src/app/`.
- Shared hooks → `src/hooks/` (future: `packages/shared/`).

### New backend capability

Follow the canonical module structure established by `src/backend/modules/search/`:

```text
src/backend/modules/<name>/
├── application/
├── domain/
├── infrastructure/
├── tests/
└── contract/
```

### New tests

See `TESTING.md` for the test taxonomy. In short:

- Feature acceptance → `tests/branch/`
- Security invariant → `tests/security/`
- Certification gate → `tests/certification/`
- Module internals → inside the module's `tests/` directory

---

## Planning and governance

- Active plans live in `.planning/`.
- Certification checklists live in `docs/PRC.md` and `docs/certification/`.
- Architecture decisions should be recorded in `docs/adr/`.

If your change touches planning, certification, or governance, update the relevant document in the same PR.

---

## Deployment

Only designated delivery branches trigger automatic deployments:

| Branch    | Target environment |
| --------- | ------------------ |
| `develop` | staging            |
| `main`    | production         |

See `docs/DEPLOYMENT_RUNBOOK.md` for manual deploy procedures and `docs/operations/delivery-audit.md` for the CI/CD overview.

---

## Questions?

- Repository navigation → `PROJECT_MAP.md`
- Architecture → `ARCHITECTURE.md`
- Testing → `TESTING.md`
- Governance → `GOVERNANCE.md`
- Security → `docs/engineering/security.md`
