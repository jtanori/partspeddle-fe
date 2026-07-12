# Phase 3 — Backend Modularization

**Branch:** `feat/phase-3-backend-modularization`
**Goal:** Promote the modular monolith pattern inside `apps/web/src/backend/modules/` by extracting repository ports/adapters and thin application services into bounded-context modules, using `backend/modules/search` as the canonical reference.

---

## Scope

This phase keeps the Next.js application in `apps/web/` and focuses on the backend layer that already lives under `apps/web/src/backend/`, `apps/web/src/repositories/`, and `apps/web/src/services/`.

### In scope

- Create four new modules under `apps/web/src/backend/modules/`:
  - `catalog`
  - `listing`
  - `seller`
  - `ai`
- Move repository interfaces (ports) into each module's `domain/` directory.
- Move repository implementations into each module's `infrastructure/` directory.
- Move the combined repository factory into `backend/modules/shared/application/repository-factory.ts`.
- Move `services/ai-vision.ts` into `ai/application/`.
- Add thin `application/index.ts` barrels for each module.
- Add `README.md` and at least one contract test per new module.
- Keep backward-compatible re-export shims at the old `@/repositories/*` and `@/services/ai-vision` paths so UI and test imports do not break.
- Update the small set of API routes and pages that import repositories directly.

### Out of scope (deferred)

- Moving widely-used shared domain types (`apps/web/src/domain/types/*`) into modules. They remain shared for now and are imported by modules.
- Moving `services/taxonomy.ts`, `services/supabase-db.ts`, `services/search/search-parts.ts`, or `SearchAnalyticsService.ts`.
- Extracting backend modules to the repository root (`backend/modules/`). That move depends on workspace/TS path changes and is deferred to a later phase.
- Large UI refactors.

---

## Target module layout

```text
apps/web/src/backend/modules/
├── search/                          # existing reference module (read-only)
├── shared/
│   └── application/
│       └── repository-factory.ts    # cross-module wiring
├── catalog/
│   ├── application/
│   │   └── index.ts
│   ├── domain/
│   │   ├── catalog-repository.ts
│   │   └── taxonomy-repository.ts   # optional port for getTaxonomy
│   ├── infrastructure/
│   │   └── supabase-catalog.repository.ts
│   ├── tests/
│   │   └── contract/
│   │       └── catalog-module.contract.test.ts
│   ├── contract/
│   │   └── README.md
│   └── README.md
├── listing/
│   ├── application/
│   │   └── index.ts
│   ├── domain/
│   │   └── listing-repository.ts
│   ├── infrastructure/
│   │   └── supabase-listing.repository.ts
│   ├── tests/
│   │   └── contract/
│   │       └── listing-module.contract.test.ts
│   ├── contract/
│   │   └── README.md
│   └── README.md
├── seller/
│   ├── application/
│   │   └── index.ts
│   ├── domain/
│   │   ├── seller-repository.ts
│   │   └── seller-profile.ts
│   ├── infrastructure/
│   │   └── supabase-seller.repository.ts
│   ├── tests/
│   │   └── contract/
│   │       └── seller-module.contract.test.ts
│   ├── contract/
│   │   └── README.md
│   └── README.md
└── ai/
    ├── application/
    │   └── analyze-listing-image.ts
    ├── domain/
    │   └── ai-analysis-result.ts    # re-export from @/types for now
    ├── infrastructure/
    │   └── README.md                # future: API client / gateway
    ├── tests/
    │   └── contract/
    │       └── ai-module.contract.test.ts
    ├── contract/
    │   └── README.md
    └── README.md
```

---

## Implementation steps

### 1. Scaffold modules

Create the directory tree above with empty `application/`, `domain/`, `infrastructure/`, `tests/contract/`, and `contract/` directories, plus a `README.md` in each module describing its bounded context and public surface.

### 2. Move repository interfaces into module `domain/`

- `apps/web/src/repositories/catalog.repository.ts` → `apps/web/src/backend/modules/catalog/domain/catalog-repository.ts`
- `apps/web/src/repositories/listing.repository.ts` → `apps/web/src/backend/modules/listing/domain/listing-repository.ts`
- `apps/web/src/repositories/specification.repository.ts` → `apps/web/src/backend/modules/catalog/domain/specification-repository.ts`
- Create `apps/web/src/backend/modules/seller/domain/seller-repository.ts` and `seller-profile.ts` from the types currently inside `impl/supabase-seller.repository.ts`.

Update imports inside moved files to use relative paths or existing `@/` aliases for shared types.

### 3. Move repository implementations into module `infrastructure/`

- `apps/web/src/repositories/impl/supabase-catalog.repository.ts` → `apps/web/src/backend/modules/catalog/infrastructure/supabase-catalog.repository.ts`
- `apps/web/src/repositories/impl/supabase-listing.repository.ts` → `apps/web/src/backend/modules/listing/infrastructure/supabase-listing.repository.ts`
- `apps/web/src/repositories/impl/supabase-seller.repository.ts` → `apps/web/src/backend/modules/seller/infrastructure/supabase-seller.repository.ts`

### 4. Move the repository factory

- Move `apps/web/src/repositories/factory.ts` → `apps/web/src/backend/modules/shared/application/repository-factory.ts`.
- Update it to import the implementations from the new module paths.

### 5. Move AI vision service

- Move `apps/web/src/services/ai-vision.ts` → `apps/web/src/backend/modules/ai/application/analyze-listing-image.ts`.
- Update its imports to reference `apps/web/src/types.ts` and `apps/web/src/lib/supabase.ts` correctly from the new location.

### 6. Add backward-compatible shims

Replace old files with thin re-exports so existing imports keep working during the transition:

- `apps/web/src/repositories/catalog.repository.ts`
- `apps/web/src/repositories/listing.repository.ts`
- `apps/web/src/repositories/specification.repository.ts`
- `apps/web/src/repositories/factory.ts`
- `apps/web/src/repositories/impl/*.ts` (or delete if no direct imports exist)
- `apps/web/src/services/ai-vision.ts`

If `impl/*.ts` has no direct consumers, delete the `impl/` directory instead.

### 7. Update direct consumers

Update the files that import repositories directly so they use the canonical module paths:

- `apps/web/src/app/(public)/listing/[id]/page.tsx`
- `apps/web/src/app/api/taxonomy/route.ts`
- `apps/web/src/app/api/parts/featured/route.ts`
- `apps/web/src/app/api/sellers/top/route.ts`
- `apps/web/src/components/seller-dashboard/draft/DraftMedia.tsx` (AI service)

### 8. Add module contract tests

For each new module, add a `tests/contract/<module>-module.contract.test.ts` that asserts the public barrel exports the expected domain ports, infrastructure implementations, and application functions.

### 9. Verify

Run the following scoped checks:

```bash
pnpm lint
pnpm typecheck
pnpm vitest run tests/branch/p5-listing-draft-wizard/listing-draft.test.tsx
pnpm vitest run apps/web/src/backend/modules/catalog/tests/contract
pnpm vitest run apps/web/src/backend/modules/listing/tests/contract
pnpm vitest run apps/web/src/backend/modules/seller/tests/contract
pnpm vitest run apps/web/src/backend/modules/ai/tests/contract
pnpm vitest run tests/branch/p5-4-repository-data-access-security/no-service-role-in-app.test.ts
```

Then push and wait for full CI on the PR.

---

## Acceptance criteria

- [ ] `apps/web/src/backend/modules/{catalog,listing,seller,ai}` exist with `application/`, `domain/`, `infrastructure/`, `tests/contract/`, and `contract/` subdirectories.
- [ ] Each new module has a `README.md` and a contract test.
- [ ] Repository interfaces live in module `domain/` and implementations in module `infrastructure/`.
- [ ] Old `@/repositories/*` and `@/services/ai-vision` paths still resolve (via re-export shims or direct moves).
- [ ] Direct API-route consumers import from module paths.
- [ ] `pnpm lint` and `pnpm typecheck` pass.
- [ ] All scoped tests pass.
- [ ] Full CI passes on the PR before merge.

---

## Risks and mitigations

| Risk | Mitigation |
|------|------------|
| Import alias breaks inside moved files | Keep using `@/` for shared types; use relative imports within the same module. |
| Other code imports old repository paths | Re-export shims remain in place; only direct consumers are updated. |
| Module boundary becomes unclear because domain types stay shared | Document the decision in each module README; migrate types in a later phase. |
| Circular dependencies between modules | Only `shared/application/repository-factory.ts` is allowed to import all three infrastructure implementations; modules must not import each other. |
| CI regressions | Run scoped lint/typecheck/tests before push; rely on full CI for final validation. |

---

## Next steps after merge

- Phase 3.x or Phase 4 can migrate the remaining services (`taxonomy`, `supabase-db`, `search/search-parts`, `SearchAnalyticsService`) into modules.
- Phase 4/5 in the platform evolution plan moves engineering tooling and governance out of the application root.
