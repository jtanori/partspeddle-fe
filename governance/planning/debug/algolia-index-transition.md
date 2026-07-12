---
status: investigating
trigger: "3 failing tests blocking promotion related to Algolia index transition (parts_inventory -> parts)"
created: 2025-05-22T10:00:00Z
updated: 2025-05-22T10:00:00Z
---

## Current Focus

hypothesis: The tests are hardcoded to use the deprecated 'parts_inventory' index or rely on data structures/behaviors specific to it.
test: Run the 3 failing tests and examine their failure output and code.
expecting: Identify references to 'parts_inventory' or incorrect configurations.
next_action: Run failing tests to gather error logs.

## Symptoms

expected: All tests in certification suite pass.
actual:

1. tests/certification/relevance-benchmark.spec.ts FAILED
2. tests/functional/search/search-sorting.spec.ts FAILED
3. tests/chaos/search/algolia-outage.spec.ts FAILED
   errors: [Pending investigation]
   reproduction: Run the specified test files.
   started: Recently (after index transition).

## Eliminated

- None yet.

## Evidence

- None yet.

## Resolution

root_cause:
fix:
verification:
files_changed: []
