# Phase 1 Implementation Plan — Workspace Scaffolding

**Branch:** `feat/phase-1-workspace-scaffolding`
**Goal:** Introduce pnpm workspaces and the new top-level directories without moving application code.
**Scope exclusions:** No application code is moved in Phase 1. Only scaffolding and shared-config extraction.

---

## 1. Context

Phase 0 created the navigation documents that describe the target topology. Phase 1 creates the physical workspace structure so subsequent phases can move files into it. The application remains in `src/` for now; only shared configuration and empty directories are introduced.

---

## 2. Deliverables

### 2.1 Update `pnpm-workspace.yaml`

**Current state:**

```yaml
packages:
  - '.'
```

**Target state:**

```yaml
packages:
  - 'apps/*'
  - 'packages/*'
  - '.'
```

Keeping `'.'` allows the root to remain a workspace member during the migration, so existing scripts and CI continue to work until Phase 2 extracts the app.

### 2.2 Create target directories

Create empty directories with `README.md` files explaining their future purpose.

```text
apps/
└── web/
    └── README.md

packages/
├── ui/
│   └── README.md
├── shared/
│   └── README.md
├── contracts/
│   └── README.md
├── types/
│   └── README.md
├── sdk/
│   └── README.md
└── config/
    └── README.md

backend/
└── modules/
    └── README.md

platform/
├── scripts/
│   └── README.md
├── ci/
│   └── README.md
├── docker/
│   └── README.md
├── deployment/
│   └── README.md
├── generators/
│   └── README.md
└── tooling/
    └── README.md

governance/
├── scgs/
│   └── README.md
├── planning/
│   └── README.md
├── certification/
│   └── README.md
├── architecture/
│   └── README.md
└── decisions/
    └── README.md
```

### 2.3 Extract `packages/config`

Move shared tooling configuration that is not app-specific into `packages/config/`:

| File                    | Target                                                 |
| ----------------------- | ------------------------------------------------------ |
| `eslint.config.js`      | `packages/config/eslint.config.js`                     |
| `prettier.config.js`    | `packages/config/prettier.config.js`                   |
| `tailwind.config.ts`    | `packages/config/tailwind.config.ts`                   |
| `postcss.config.js`     | `packages/config/postcss.config.js`                    |
| `tsconfig.json`         | Keep at root; add `packages/config/tsconfig.base.json` |
| `commitlint.config.cjs` | `packages/config/commitlint.config.cjs`                |

Root config files will be updated to re-export or extend the shared versions where practical. For files that must stay at root (e.g., `tsconfig.json`), a base config is created and the root file extends it.

### 2.4 Update root `package.json`

Changes:

- Add `"private": true` to enforce workspace usage.
- Add a `workspaces` field as a fallback/annotation (pnpm primarily uses `pnpm-workspace.yaml`).
- Update script paths if they reference moved config files.
- Add workspace dependency placeholders (e.g., `"@partspeddle/config": "workspace:*"`) for internal packages that will be consumed in later phases.

### 2.5 Update `.gitignore` and tooling paths

- Ensure empty directories are tracked via their `README.md` files.
- Update `.prettierignore` and `.eslintignore` if they exist.
- Update `lint-staged` paths in `package.json` if config file locations change.

---

## 3. Implementation Order

1. **Backup verification baseline** — record current `pnpm test`, `pnpm lint`, `pnpm typecheck`, `pnpm build` outcomes (or note they are deferred per project rules).
2. **Update `pnpm-workspace.yaml`** — add `apps/*` and `packages/*`.
3. **Create empty directories** — with READMEs.
4. **Move shared config** — into `packages/config/` and update root re-exports.
5. **Update `package.json`** — private flag, workspaces field, script paths.
6. **Run verification** — lint, typecheck, and a focused test to ensure nothing broke.

---

## 4. Verification

- `pnpm lint` must pass.
- `pnpm typecheck` must pass.
- `pnpm test tests/security/headers.spec.ts` must pass (smoke check).
- `pnpm install` succeeds and lockfile is valid.
- `pnpm delivery:manifest:validate` still passes.

---

## 5. Risks & Mitigations

| Risk                                   | Mitigation                                                                 |
| -------------------------------------- | -------------------------------------------------------------------------- |
| Moving config breaks lint-staged or CI | Keep root re-exports; update `package.json` script paths atomically.       |
| Workspace changes break pnpm install   | Keep root as a workspace member; validate lockfile.                        |
| Empty directories are not tracked      | Add `README.md` to each.                                                   |
| TypeScript resolution changes          | Keep root `tsconfig.json` minimal; base config lives in `packages/config`. |

---

## 6. Scope Exclusions

- No files under `src/` are moved.
- No CI workflows are moved (Phase 4).
- No scripts are moved (Phase 4).
- No governance files are moved (Phase 5).
- No docs are reorganized (Phase 6).
