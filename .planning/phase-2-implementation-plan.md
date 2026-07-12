# Phase 2 — Application Extraction to `apps/web/`

## Goal

Move the Next.js application out of the repository root and into `apps/web/` so the root becomes a workspace orchestrator and `apps/web/` owns the deployable web artifact. No functional changes to the application itself.

## Branch

`feat/phase-2-app-extraction`

Base: `develop`

---

## Scope

### 1. Move application source into `apps/web/src/`

Move these directories/files from the repository root into `apps/web/`:

- `src/app/` → `apps/web/src/app/`
- `src/components/` → `apps/web/src/components/`
- `src/hooks/` → `apps/web/src/hooks/`
- `src/lib/` → `apps/web/src/lib/`
- `src/context/` → `apps/web/src/context/`
- `src/domain/` → `apps/web/src/domain/`
- `src/projection/` → `apps/web/src/projection/`
- `src/navigation/` → `apps/web/src/navigation/`
- `src/backend/` → `apps/web/src/backend/`
- `src/assets/` → `apps/web/src/assets/`
- `src/repositories/` → `apps/web/src/repositories/`
- `src/search/` → `apps/web/src/search/`
- `src/services/` → `apps/web/src/services/`
- `src/store/` → `apps/web/src/store/`
- `src/styles/` → `apps/web/src/styles/`
- `src/viewmodels/` → `apps/web/src/viewmodels/`
- `src/index.css` → `apps/web/src/index.css`
- `src/proxy.ts` → `apps/web/src/proxy.ts`
- `src/types.ts` → `apps/web/src/types.ts`
- `public/` → `apps/web/public/`

Files to leave at root:

- `src/` directory itself is removed once emptied.
- Root-level scripts, operations, docs, tests, platform, governance remain untouched.

### 2. Move application config into `apps/web/`

- `next.config.ts` → `apps/web/next.config.ts`
- `tsconfig.json` → `apps/web/tsconfig.json`
- `tailwind.config.ts` → `apps/web/tailwind.config.ts`
- `postcss.config.js` → `apps/web/postcss.config.js`

Root keeps thin re-exports where needed:

- Root `eslint.config.js` already re-exports `packages/config/eslint.config.js`; leave as-is.
- Root `tailwind.config.ts` and `postcss.config.js` can be removed once the app owns them.

### 3. Update path aliases

`apps/web/tsconfig.json`:

```json
{
  "extends": "../../packages/config/tsconfig.base.json",
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src", ".next/types/**/*.ts", ".next/dev/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

Root `tsconfig.json` becomes workspace-wide only:

```json
{
  "extends": "./packages/config/tsconfig.base.json",
  "include": ["scripts", "operations"],
  "exclude": ["supabase", "node_modules", "scripts/archive", "apps", "packages"]
}
```

### 4. Update package scripts

Root `package.json`:

- Remove direct Next.js scripts (`dev`, `build`, `start`, `lint`, `typecheck`) from root.
- Add workspace-scoped scripts:
  - `"dev": "pnpm --filter @partspeddle/web dev"`
  - `"build": "pnpm --filter @partspeddle/web build"`
  - `"start": "pnpm --filter @partspeddle/web start"`
  - `"lint": "pnpm --filter @partspeddle/web lint"`
  - `"typecheck": "pnpm --filter @partspeddle/web typecheck"`
- Keep repository-level scripts (`test`, `test:e2e`, delivery, security, scgs, db, etc.) at root because they span workspaces.

`apps/web/package.json`:

- Update scripts to operate on the app directory:
  - `"dev": "next dev"`
  - `"build": "next build"`
  - `"start": "next start"`
  - `"lint": "eslint --cache src"`
  - `"typecheck": "tsc --noEmit"`
- Add app-specific dependencies currently only in root (Next.js, React, Tailwind, etc.) as explicit `dependencies`/`devDependencies`.

### 5. Update shared config packages

`packages/config/tailwind.config.ts`:

- Update `content` glob to scan `apps/web/src/**/*.{js,ts,jsx,tsx}` instead of `./src/**/*.{js,ts,jsx,tsx}`.

`packages/config/eslint.config.js`:

- Update file globs to include `apps/web/src` as needed.

`packages/config/tsconfig.base.json`:

- Ensure it remains workspace-neutral (no app-specific paths).

### 6. Update CI workflow

`.github/workflows/ci.yml`:

- `pnpm lint` and `pnpm typecheck` already delegate via root scripts once updated.
- `pnpm build` delegates to the web app.
- `pnpm storybook:build` — verify Storybook config location and add `--filter @partspeddle/web` if Storybook moves with the app.
- No structural workflow changes otherwise; the same jobs run.

### 7. Update Dockerfile

`Dockerfile` stays at root but must copy the workspace layout:

```dockerfile
COPY package.json pnpm-lock.yaml .npmrc pnpm-workspace.yaml ./
COPY apps/web/package.json ./apps/web/package.json
COPY packages/config/package.json ./packages/config/package.json
# other workspace packages as needed
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm build
```

The standalone output path remains `.next/standalone` inside the build working directory, so runner stage copy commands stay the same.

### 8. Update tests

- Tests that import from `../../../src/...` relative paths must be updated to `../../../apps/web/src/...`.
- Tests using `@/` aliases should continue resolving via `apps/web/tsconfig.json` if the test runner is configured to use that tsconfig.
- Run scoped tests first:
  - `tests/security/headers.spec.ts`
  - `tests/branch/p5-2-routing-proxy-session-security/proxy-session-security.test.ts`
  - `tests/branch/p5-6-frontend-client-security/frontend-security.test.ts`
  - `tests/branch/p5-seller-workspace-shell/seller-workspace-shell.test.tsx`

### 9. Update documentation

- `README.md`: update path references from `src/` to `apps/web/src/`.
- `docs/PRC.md`: update `src/proxy.ts` reference to `apps/web/src/proxy.ts`.
- `docs/engineering/security.md`: update CSP/middleware/proxy references.
- `apps/web/README.md`: replace "Phase 1 scaffolding only" with current app description.

### 10. Verification

Run in sequence:

```bash
pnpm install
pnpm lint
pnpm typecheck
pnpm vitest run tests/security/headers.spec.ts tests/branch/p5-2-routing-proxy-session-security/proxy-session-security.test.ts tests/branch/p5-6-frontend-client-security/frontend-security.test.ts
pnpm delivery:manifest:validate
```

Then attempt a build (may be slow locally; the goal is no middleware/proxy or path-resolution errors):

```bash
pnpm build
```

---

## Out of Scope

- Moving `tests/` into `apps/web/` or a separate workspace package.
- Extracting shared UI/components into `packages/ui`.
- Moving backend modules out of `apps/web/src/backend/` into a standalone workspace package.
- Refactoring any application logic.

---

## Risks & Mitigations

| Risk                           | Mitigation                                                                                         |
| ------------------------------ | -------------------------------------------------------------------------------------------------- |
| `@/` aliases break in tests    | Update vitest/tsconfig resolution to point at `apps/web/tsconfig.json` or alias via vitest config. |
| Tailwind misses app classes    | Update `content` glob in `packages/config/tailwind.config.ts`.                                     |
| Dockerfile build fails         | Update COPY instructions to include workspace files; test with `flyctl deploy --build-only`.       |
| CI lint/typecheck paths stale  | Root scripts delegate to workspace scripts; update `apps/web/package.json` scripts.                |
| Storybook config path mismatch | Keep Storybook root config if it depends on app source, or move config with app.                   |

---

## Definition of Done

- `apps/web/` contains the full Next.js application and builds successfully.
- Root no longer contains `src/` application code.
- `pnpm lint`, `pnpm typecheck`, and scoped tests pass.
- CI on PR #? is green.
- Documentation references point to `apps/web/src/` paths.
