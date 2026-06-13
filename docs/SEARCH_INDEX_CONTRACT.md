# Search Index Contract Audit

## Overview
This document defines the current state, constraints, and requirements for the Algolia search index implementation for PartsPeddle.

## Current Indexed Fields (from Edge Function `parts` index)
- objectID (part.id)
- title
- description
- price (price_mxn)
- status
- category (Nested object: id, name_es, name_en)
- part_type (Nested object: id, name_es, name_en)
- vehicle (Nested object: variant_id, year, model_name, brand_name)
- seller (Nested object: id, business_name, location, whatsapp)
- images (Array of objects)
- primary_image (URL)
- created_at

## Identified Discrepancies
- **Dual-Indexing Conflict**: The system appears to be maintaining two separate indexing paths:
    1. Real-time sync: `parts` table -> `parts` Algolia index (via `supabase/functions/sync-algolia-webhook/`)
    2. Batch sync: `listings` table -> `parts_inventory` Algolia index (via `scripts/sync-to-algolia.ts`)

This dual-indexing is a critical architectural issue that must be addressed before proceeding with the search page redesign.

## Required UI Fields (Target)
- Title
- Price
- Condition (Currently Missing)
- Make (Flattened)
- Model (Flattened)
- Year (Flattened)
- Category (Flattened)
- Part Type (Flattened)
- Seller Verified (Currently Missing)
- Location (Flattened)
- Primary Image URL
