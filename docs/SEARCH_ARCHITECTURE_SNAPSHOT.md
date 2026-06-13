# Search Architecture Snapshot

> **Master Reference**: For detailed system architecture, data modeling, and synchronization strategies, please refer to the [Search Engine Infrastructure](SEARCH_INFRASTRUCTURE.md) document.

## Overview
This document serves as a consolidated reference for the current search implementation, designed for architectural review and remediation planning.


## 1. Methodology & Workflow

The system utilizes a **Search-as-a-Service** model backed by Algolia, with a dual-pipeline for data synchronization.

- **State Management**: Search state (query, filters, view mode) is persisted directly in the URL search parameters to ensure shareability and deep-linking compatibility.
- **Data Pipeline**:
  - **Source of Truth**: Supabase `parts` table (and `listings` table).
  - **Synchronization**: Two paths:
    1. Real-time sync: `supabase/functions/sync-algolia-webhook/`
    2. Batch sync: `scripts/sync-to-algolia.ts` (currently causing indexing conflicts).
  - **Query Flow**: Frontend -> Next.js API Route/Proxy -> Search API Handler -> Algolia + Fitment Service -> Frontend.

## 2. Component Structure

- **Frontend (`src/app/(public)/search/`)**:
  - `SearchPageContent`: Main controller component managing URL state, sidebar state, and results rendering.
  - `SearchResultsController`: Handles API orchestration (triggers data fetch, handles loading/error states).
  - `ProductSidebar`, `GridResultsView`, `ListResultsView`: Presentation layer components.
- **Backend (`src/backend/modules/search/`)**:
  - **Contracts**: `search-api-handler.ts` (API entry point).
  - **Application**: `vehicle-fitment-search-service.ts` (handles complex fitment logic).
  - **Infrastructure**: `algolia-search-repository.ts` (abstracts Algolia SDK).

## 3. Routing & API Communication

- **Client-Side Routing**: Next.js `useRouter`/`usePathname` for managing query params.
- **API Endpoint**: Expected pattern `/api/parts/search` (implied by `SEARCH_DATA_FLOW.md`).
- **Communication Protocol**: JSON API returning:
  - `hits`: Array of part objects.
  - `facets`: Facet metadata (currently limited).
  - `pagination`: Total hits, current page, total pages.

## 4. Identified Architectural Issues

1. **Missing Metadata**: Facet metadata is currently limited in the pipeline, forcing client-side filtering/counting which should be offloaded to Algolia.
2. **Fitment Overhead**: Complex fitment logic is applied as a secondary filter on the API handler _after_ Algolia retrieval, impacting latency and results precision.
