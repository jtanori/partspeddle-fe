# Backend modules

PartsPeddle's backend is organized as a **modular monolith** under `apps/web/src/backend/modules/`. Each module represents a bounded context with clear layers.

## Canonical module structure

```text
backend/modules/<name>/
├── application/          # Use cases, factories, and public barrels
├── domain/               # Ports (repository interfaces) and domain types
├── infrastructure/       # Adapters (Supabase repositories, API clients, etc.)
├── tests/
│   ├── contract/         # Public-surface contracts
│   ├── integration/      # Adapter/integration tests
│   ├── performance/      # Benchmarks
│   └── resilience/       # Failure-mode tests
├── contract/             # Operational contracts and documentation
└── README.md             # Bounded-context overview
```

## Current modules

| Module | Bounded context | Public exports |
|--------|-----------------|----------------|
| `search` | Search indexing, querying, and ranking | `BuildSearchDocumentUseCase`, `AlgoliaSearchRepository`, etc. |
| `catalog` | Product taxonomy, categories, specifications | `CatalogRepository`, `SpecificationRepository`, `SupabaseCatalogRepository`, `createCatalogRepository` |
| `listing` | Marketplace listings and drafts | `ListingRepository`, `SupabaseListingRepository`, `createListingRepository` |
| `seller` | Seller profiles and verification | `SellerRepository`, `SellerProfile`, `SupabaseSellerRepository`, `createSellerRepository` |
| `ai` | AI-assisted features | `analyzeListingImage` |
| `shared` | Cross-cutting backend wiring | `createRepositories` factory |

## Import conventions

Import from a module's public barrel whenever possible:

```ts
import { createCatalogRepository } from '@/backend/modules/catalog';
import { analyzeListingImage } from '@/backend/modules/ai';
```

Internal module code should use relative imports. Shared domain types that are still being migrated live in `@/domain/types/*` and are imported by modules.

## Repository factory

API routes can create a full set of repositories with the appropriate Supabase client:

```ts
import { createRepositories } from '@/backend/modules/shared/application/repository-factory';

const { catalog, listing, seller } = createRepositories('public');
```

- `'public'` uses the anon-key client and respects RLS.
- `'authenticated'` uses the cookie-session client bound to the request.

## Migration notes

- Phase 3 extracted repository ports/adapters and the AI vision service into modules.
- Legacy `@/repositories/*` and `@/services/ai-vision` paths still resolve via re-export shims.
- Shared domain types (`@/domain/types/*`) will migrate into modules incrementally as bounded contexts stabilize.
- Remaining services (`taxonomy`, `supabase-db`, `search/search-parts`, `SearchAnalyticsService`) will move into modules in a follow-up phase.
