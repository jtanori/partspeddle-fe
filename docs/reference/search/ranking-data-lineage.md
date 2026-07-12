# Search Ranking Data Lineage Audit

## 1. Finding

All ranking signals (`listing_quality_score`, `seller_trust_score`, `created_at`) returned from the current search infrastructure have **zero variance** (all values are `0`).

## 2. Impact

The `RankingEngine` is currently unable to perform ranking because it receives no signals to rank against. The system is currently relying on tie-breaking logic (`localeCompare` of listing IDs) rather than semantic relevance.

## 3. Lineage Audit

| Factor                  | Exists in DB? | Persisted in Search Index? | Non-Zero Variance? |
| :---------------------- | :-----------: | :------------------------: | :----------------: |
| `listing_quality_score` |       ?       |             No             |       **NO**       |
| `seller_trust_score`    |       ?       |             No             |       **NO**       |
| `created_at`            |      Yes      |             No             |       **NO**       |

## 4. Next Actions

- [ ] Investigate the Supabase search pipeline to identify where these fields are dropped or not populated.
- [ ] Determine if these fields need to be added to the search index (Algolia/Supabase Search) schema.
- [ ] Re-enable ranking factors in the `SpecificationCompiler` once the data pipeline provides non-zero variance.
