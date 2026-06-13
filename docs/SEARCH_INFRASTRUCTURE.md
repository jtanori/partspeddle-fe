# Search Engine Infrastructure & Synchronization

This document outlines the architecture, data modeling, and synchronization strategies for the search platform.

## 0. Index of Search Documentation

- `docs/ALGOLIA_ATTRIBUTE_MATRIX.md`: Mapping of DB fields to Algolia attributes.
- `docs/PRC_DB_SEARCH.md`: Database search certification.
- `docs/SEARCH_AUDIT.md`: General search platform audit.
- `docs/SEARCH_DATA_FLOW.md`: Data movement from DB to Algolia.
- `docs/SEARCH_HARDENING_PLAN.md`: Reliability improvements roadmap.
- `docs/SEARCH_INDEX_CONTRACT.md`: Index consistency expectations.
- `docs/SEARCH_PLATFORM_PRC.md`: Search Platform Production Readiness.
- `docs/SEARCH_V2_INDEX_SPEC.md`: Flattened Algolia index schema.
- `docs/UI_SEARCH_PLAN.md`: Frontend search UI implementation plan.

### Search Testing Suites

- **Unit (Domain/Application)**: `tests/unit/search/`
- **Functional (API/Routes)**: `tests/functional/search/`
- **E2E (UI/Workflow)**: `tests/e2e/search/`

---

## 1. Data Modeling & Enums

The system enforces data integrity through PostgreSQL ENUM types for core attributes.

### Part Status (`part_status`)

- `DRAFT` | `PENDING_REVIEW` | `AVAILABLE` | `RESERVED` | `SOLD` | `REMOVED` | `ARCHIVED`

### Part Condition (`part_condition`)

- `NEW` | `REMANUFACTURED` | `USED_EXCELLENT` | `USED_GOOD` | `USED_FAIR` | `FOR_PARTS`

---

## 2. The Transactional Outbox Pattern

...

To ensure reliable data synchronization and low API latency, we use the **Transactional Outbox Pattern**.

### Why it exists:

- **Consistency**: Guarantees that if a part is saved to the database, it will _eventually_ be indexed in Algolia, even if Algolia is temporarily down.
- **Performance**: API routes return "Success" immediately after a database write without waiting for slow external network calls to Algolia.
- **Throttling**: Allows us to batch and throttle updates to Algolia to avoid rate limits.

### How it works:

1.  **Instruction**: Any change to a `part` (Insert, Update, Delete) triggers an entry in the `search_outbox` table.
2.  **Persistence**: The outbox entry is saved in the same transaction as the part data.
3.  **Consumption**: A background **Worker** polls the outbox, transforms the data, and pushes it to Algolia.
4.  **Completion**: Once Algolia confirms success, the outbox entry is marked as `processed: true`.

---

## 2. Search V2 Object Modeling

The search engine uses a **Flattened Schema** to optimize performance and simplify frontend logic. This structure is defined in `SEARCH_V2_INDEX_SPEC.md`.

### Target Algolia Schema:

| Field                     | Type   | Description                                           |
| :------------------------ | :----- | :---------------------------------------------------- |
| `objectID`                | UUID   | Matches the `parts.id` in Supabase.                   |
| `title` / `description`   | String | Core searchable text.                                 |
| `price`                   | Number | Integer value in MXN.                                 |
| `make` / `model` / `year` | Mixed  | Flattened vehicle fitment data.                       |
| `category` / `part_type`  | String | Flattened taxonomy (in Spanish/name_es).              |
| `condition`               | String | Validated values: `used_excellent`, `used_good`, etc. |
| `seller_name`             | String | Business name or "Particular".                        |
| `seller_trust_score`      | Number | (0-100) Reputation metric.                            |
| `listing_quality_score`   | Number | (0-100) Completeness/Appeal metric.                   |
| `image_url`               | String | URL of the primary listing image.                     |
| `created_at`              | Number | Unix Timestamp for recency sorting.                   |

---

## 3. Ranking & Relevance

Ranking is a multi-layered process that combines text relevance with business logic.

### Searchable Attributes (Priority Order):

1.  `title` (Highest weight)
2.  `part_type`
3.  `category`
4.  `make` / `model`
5.  `seller_name`

### Custom Ranking (Tie-breakers):

When multiple results match a search term equally, they are ordered by:

1.  **Listing Quality Score** (descending): Higher-quality listings with photos and long descriptions come first.
2.  **Seller Trust Score** (descending): Verified and trusted sellers are promoted.
3.  **Recency** (descending): Newest listings are favored.

---

## 4. Replicas & Sorting

Algolia requires **Replicas** for sorting by attributes other than "Relevance".

- **Primary Index (`parts`)**: Default relevance-based search.
- **Replica (`parts_newest`)**: Hard-sorted by `created_at` DESC.
- **Replica (`parts_price_asc`)**: Hard-sorted by `price` ASC.
- **Replica (`parts_price_desc`)**: Hard-sorted by `price` DESC.

_Note: All replicas inherit the Searchable Attributes and use Quality/Trust scores as secondary tie-breakers._

---

## 5. Deployment: Running the Outbox in Production

In a production environment (e.g., Fly.io), the outbox processor runs as a long-lived background worker.

### Strategy: Background Machine (Recommended)

The outbox is managed by `scripts/process-search-outbox.ts`.

1.  **Dockerization**: The application image includes the worker script.
2.  **Fly.io Process Groups**: We define a `worker` process in `fly.toml`:
    ```toml
    [processes]
    app = "npm start"
    worker = "pnpm exec tsx scripts/process-search-outbox.ts"
    ```
3.  **Scaling**: The worker can be scaled independently of the web application.

---

## 6. Maintenance & Reindexing

### Full Reindex

If the schema or ranking logic changes significantly, you can force a full re-sync:

```bash
# Option A: Fast batch script (Direct push)
pnpm exec tsx scripts/algolia/reindex-algolia.ts

# Option B: Reliable queue (Via Outbox)
# Queues all parts to be processed asynchronously by the background worker.
pnpm exec tsx -e "/* Custom script to queue IDs */"
```

### Configuration Changes

To update Algolia settings (searchable fields, ranking, replicas) without touching the Algolia dashboard:

```bash
pnpm exec tsx scripts/algolia/configure-algolia-index.ts
```
