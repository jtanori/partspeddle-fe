# RLS Policy Map

This document maps every application route/repository to the Postgres Row-Level Security (RLS) policies it requires. It is the source of truth for P5.7 database security alignment.

---

## Policy Matrix

| Table                 | Operation | Required policy                                     | Client        | Route / Repository                                                                 |
| --------------------- | --------- | --------------------------------------------------- | ------------- | ---------------------------------------------------------------------------------- |
| `parts`               | SELECT    | Public read only `status = 'AVAILABLE'`             | anon          | `(public)/page.tsx`, `/api/parts/featured`, `/api/search/parts`, ListingRepository |
| `parts`               | SELECT    | `seller_id = auth.uid()`                            | authenticated | `/api/seller/inventory`                                                            |
| `parts`               | INSERT    | `seller_id = auth.uid()`                            | authenticated | `publish_listing_draft` RPC (via service role)                                     |
| `parts`               | UPDATE    | `seller_id = auth.uid()`                            | authenticated | Seller inventory mutations                                                         |
| `parts`               | DELETE    | `seller_id = auth.uid()`                            | authenticated | Seller inventory mutations                                                         |
| `seller_profiles`     | SELECT    | Public read only `verification_status = 'verified'` | anon          | `(public)/page.tsx`, `/api/sellers/top`, SellerRepository                          |
| `seller_profiles`     | SELECT    | `user_id = auth.uid()`                              | authenticated | `/api/seller/profile`                                                              |
| `seller_profiles`     | UPDATE    | `user_id = auth.uid()`                              | authenticated | `/api/seller/profile`                                                              |
| `listing_drafts`      | SELECT    | `seller_id = auth.uid()`                            | authenticated | `/api/seller/drafts/*`                                                             |
| `listing_drafts`      | INSERT    | `seller_id = auth.uid()`                            | authenticated | `/api/seller/drafts/active`                                                        |
| `listing_drafts`      | UPDATE    | `seller_id = auth.uid()`                            | authenticated | `/api/seller/drafts/[id]`                                                          |
| `listing_drafts`      | DELETE    | `seller_id = auth.uid()`                            | authenticated | `/api/seller/drafts/[id]/discard`                                                  |
| `part_images`         | SELECT    | Linked to `AVAILABLE` parts                         | anon          | `(public)/listing/[id]`, ListingRepository                                         |
| `categories`          | SELECT    | Public read                                         | anon          | `/api/taxonomy`, CatalogRepository                                                 |
| `part_types`          | SELECT    | Public read                                         | anon          | `/api/taxonomy`, CatalogRepository                                                 |
| `search_events`       | INSERT    | Allow anon/authenticated inserts                    | anon          | `/api/search/events`                                                               |
| `search_click_events` | INSERT    | Allow anon/authenticated inserts                    | anon          | `/api/search/clicks`                                                               |
| `conversations`       | SELECT    | Participant only                                    | authenticated | Buyer/seller messaging                                                             |
| `messages`            | SELECT    | Participant only                                    | authenticated | Buyer/seller messaging                                                             |

---

## Service-Role Exceptions

These operations legitimately bypass RLS using `supabaseAdmin`:

| Operation                          | Justification                                    | Audit trail                    |
| ---------------------------------- | ------------------------------------------------ | ------------------------------ |
| `/api/admin/search/reindex`        | Admin batch reindex of all parts                 | `admin_actions` / `audit_log`  |
| `/api/seller/inventory/commit`     | `commit_inventory_package` RPC                   | `audit_log` trigger on `parts` |
| `/api/seller/drafts/[id]/publish`  | `publish_listing_draft` RPC                      | `audit_log` trigger on `parts` |
| `/api/seller/assets/upload`        | Storage upload path namespacing                  | Storage object metadata        |
| `/api/seller/upload-logo`          | Logo upload path namespacing                     | Storage object metadata        |
| `/api/seller/profile` (POST)       | Atomic update across `users` + `seller_profiles` | `audit_log` trigger            |
| Background search index worker     | Batch search indexing                            | Worker logs                    |
| Health-check DB connectivity probe | Service liveness check                           | Health endpoint logs           |

---

## Migration

The RLS policies above are applied in `supabase/migrations/20260709210000_p5_7_rls_alignment.sql`.

When adding new tables:

1. Run `ALTER TABLE ... ENABLE ROW LEVEL SECURITY;`.
2. Add explicit `FOR SELECT/INSERT/UPDATE/DELETE` policies.
3. Update this map.
4. Add a tenant-isolation branch test.
