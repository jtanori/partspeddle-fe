# Algolia Ranking Execution Path

## 1. Search Request Lifecycle

1.  **Client UI**: `SearchResultsController` / `SearchResultsView` sends request.
2.  **API Route**: `src/app/api/search/parts/route.ts` receives request.
3.  **Repository**: Calls `AlgoliaSearchRepository.search()`.
4.  **Algolia Client**: Communicates with `algoliaClient`.
5.  **Index/Replica**: Depending on `sortBy` param, selects `SEARCH_INDEX_NAME` (primary), `INDEX_PRICE_ASC`, `INDEX_PRICE_DESC`, or `INDEX_NEWEST`.
6.  **Algolia Evaluation**: Evaluates ranking rules based on index settings (`ranking` and `customRanking`).

## 2. Inventory of Current Algolia Config

| Attribute                | Status                                                            |
| :----------------------- | :---------------------------------------------------------------- |
| **SearchableAttributes** | title, part_type, category, description, make, model, seller_name |
| **CustomRanking**        | Empty on Primary, populated on replicas (Price/Newest)            |
| **Ranking Rules**        | typo, geo, words, filters, proximity, attribute, exact            |
| **Replicas**             | `INDEX_PRICE_ASC`, `INDEX_PRICE_DESC`, `INDEX_NEWEST`             |

## 3. Findings

- Primary index has `customRanking: []`.
- Replicas explicitly configure `desc(listing_quality_score)`, `desc(seller_trust_score)`, `desc(created_at)`.
- If traffic hits the Primary index, ranking signals are effectively disabled.

## 4. Lineage Audit

| Factor                  | Source                     | Index Indexed?     | Variance > 0?             |
| :---------------------- | :------------------------- | :----------------- | :------------------------ |
| `listing_quality_score` | BuildSearchDocumentUseCase | Yes (in doc)       | TBD (Need diagnostic run) |
| `seller_trust_score`    | BuildSearchDocumentUseCase | Yes (in doc)       | TBD (Need diagnostic run) |
| `created_at`            | Part.created_at            | Yes (as timestamp) | Yes                       |

_Next: Execute diagnostic script to verify values in the live index._
