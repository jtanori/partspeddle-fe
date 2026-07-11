# Search Ranking Truth Inventory

This document captures the current Algolia ranking configuration. This is the source material for PR #2C (Ranking Migration).

## 1. Primary Index Configuration

| Attribute | Value |
| :--- | :--- |
| **Searchable Attributes** | title, part_type, category, description, make, model, seller_name |
| **Faceting Attributes** | category, part_type, make, model, condition, seller_verified, location, year |
| **Ranking Rules** | typo, geo, words, filters, proximity, attribute, exact |

## 2. Ranking Factors (Custom Ranking)

These are the primary signals used to calculate relevance. These must be ported to the SCGS Compiler.

| Factor | Direction | Current Source |
| :--- | :--- | :--- |
| `listing_quality_score` | `desc` | Algolia customRanking |
| `seller_trust_score` | `desc` | Algolia customRanking |
| `created_at` | `desc` | Algolia customRanking (Replica: Newest) |
| `price` | `asc/desc` | Algolia Replicas (Price ASC/DESC) |

## 3. Replicas

*   **Price ASC**: `asc(price)` + custom ranking
*   **Price DESC**: `desc(price)` + custom ranking
*   **Newest First**: `desc(created_at)` + custom ranking
