# Catalog module

Bounded context for product taxonomy, categories, specifications, and catalog-level read models.

## Structure

- `domain/` — repository ports (`CatalogRepository`, `SpecificationRepository`) and catalog-specific domain types.
- `infrastructure/` — Supabase-backed implementations of the repository ports.
- `application/` — public use cases and module barrel exports.
- `tests/contract/` — contracts that verify the module's public surface.
- `contract/` — operational/contracts documentation.

## Public surface

```ts
import {
  CatalogRepository,
  SpecificationRepository,
  SupabaseCatalogRepository,
  createCatalogRepository,
} from '@/backend/modules/catalog';
```

## Notes

Shared domain types (e.g. `CatalogCategory`) still live in `@/domain/types/catalog.types` while the modularization is in progress. This module imports them; they will migrate here incrementally.
