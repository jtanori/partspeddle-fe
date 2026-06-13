# ALGOLIA_ATTRIBUTE_MATRIX.md

This matrix maps database schema fields to the Algolia index configuration to ensure proper facet and search behavior, based on the `SEARCH_V2_INDEX_SPEC.md` authoritative model.

| Attribute         | DB Field                              | Searchable | Facet     | UI Used |
| ----------------- | ------------------------------------- | ---------- | --------- | ------- |
| `title`           | `parts.title`                         | ✓          | ✗         | ✓       |
| `description`     | `parts.description`                   | ✓          | ✗         | ✓       |
| `price`           | `parts.price_mxn`                     | ✗          | ✗ (Range) | ✓       |
| `status`          | `parts.status`                        | ✗          | ✗         | ✓       |
| `make`            | `makes.name`                          | ✓          | ✓         | ✓       |
| `model`           | `models.name`                         | ✓          | ✓         | ✓       |
| `year`            | `vehicle_variants.year`               | ✗          | ✓         | ✓       |
| `category`        | `categories.name`                     | ✓          | ✓         | ✓       |
| `part_type`       | `part_types.name`                     | ✓          | ✓         | ✓       |
| `condition`       | `parts.condition`                     | ✗          | ✓         | ✓       |
| `seller_name`     | `seller_profiles.business_name`       | ✓          | ✗         | ✓       |
| `seller_verified` | `seller_profiles.verification_status` | ✗          | ✓         | ✓       |
| `seller_rating`   | `seller_profiles.rating`              | ✗          | ✗         | ✓       |
| `location`        | `seller_profiles.location`            | ✗          | ✓         | ✓       |
| `image_url`       | `part_images.url`                     | ✗          | ✗         | ✓       |
| `created_at`      | `parts.created_at`                    | ✗          | ✗         | ✓       |

## Indexing Pipeline Note

The indexing pipeline (`scripts/sync-to-algolia.ts` or corresponding webhook function) must be updated to ensure _all_ attributes listed above are correctly denormalized into the Algolia records before facet-based filtering will function correctly in the UI.
