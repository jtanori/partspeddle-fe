# Shared backend utilities

Cross-cutting backend concerns that do not belong to a single bounded-context module.

## Contents

- `application/repository-factory.ts` — creates repository instances backed by the appropriate Supabase client for a request context.

This directory is intentionally small. Resist adding domain logic here; if it belongs to a module, move it there.
