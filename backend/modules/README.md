:# backend/modules

Modular monolith backend for PartsPeddle / VinTrack.

## Canonical module structure

```text
backend/modules/<name>/
├── application/          # Use cases and command/query handlers
├── domain/               # Domain entities, value objects, policies
├── infrastructure/       # Repository adapters and external clients
├── tests/                # Module tests
│   ├── contract/
│   ├── integration/
│   ├── performance/
│   └── resilience/
└── contract/             # Operational contracts
```

## Reference module

`src/backend/modules/search/` is the canonical reference implementation. Code currently in `src/backend/modules/` will move here in Phase 3.

## Status

Phase 1 scaffolding only.
