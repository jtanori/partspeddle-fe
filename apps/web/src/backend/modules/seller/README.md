# Seller module

Bounded context for seller profiles, verification status, and seller-centric read models.

## Structure

- `domain/` — repository port (`SellerRepository`) and seller profile types.
- `infrastructure/` — Supabase-backed implementation of the seller repository.
- `application/` — public use cases and module barrel exports.
- `tests/contract/` — contracts that verify the module's public surface.
- `contract/` — operational/contracts documentation.

## Public surface

```ts
import {
  SellerRepository,
  SellerProfile,
  SupabaseSellerRepository,
  createSellerRepository,
} from '@/backend/modules/seller';
```
