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

- None currently identified. The system now uses a single `parts` index for all search operations.

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
