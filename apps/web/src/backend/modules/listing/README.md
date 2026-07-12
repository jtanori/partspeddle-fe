# Listing module

Bounded context for marketplace listings: creation, drafts, publication, and read access.

## Structure

- `domain/` — repository port (`ListingRepository`) and listing-specific domain types.
- `infrastructure/` — Supabase-backed implementation of the listing repository.
- `application/` — public use cases and module barrel exports.
- `tests/contract/` — contracts that verify the module's public surface.
- `contract/` — operational/contracts documentation.

## Public surface

```ts
import {
  ListingRepository,
  SupabaseListingRepository,
  createListingRepository,
} from '@/backend/modules/listing';
```

## Notes

Shared domain types (e.g. `MarketplaceListing`, `ListingDraft`) still live in `@/domain/types` while the modularization is in progress. This module imports them; they will migrate here incrementally.
