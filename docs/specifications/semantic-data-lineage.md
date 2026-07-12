# Semantic Data Lineage

## Purpose

Trace how a listing's semantic artifact evolves from raw input to ranked output
and back again. Lineage supports debugging, drift detection, and compliance.

## Lineage identifiers

A `LineageId` uniquely identifies an artifact version in the semantic lineage:

```ts
type LineageId = string; // `${listingId}:${version}:${checksum}`
```

It is derived deterministically from:

1. `listingId`
2. `version`
3. `checksum` of `compiled`

## Lineage graph

```
Raw specs  →  Compiler  →  CompiledSpecificationSet  →  Artifact
     ↑                                                ↓
Category defs                                    Replay trace
     ↑                                                ↓
Seller input                                  Governance verdict
```

## Replay trace

A `SemanticReplayTrace` records every semantic transition between two artifact
snapshots:

- `GROUP_CHANGE`
- `FACET_CHANGE`
- `ORDER_CHANGE`
- `COMPILER_RUN`
- `PTS_SHIFT`
- `CI_VERDICT`

Each event stores:

- `step` — ordered position in the trace
- `snapshotBefore` / `snapshotAfter` — lineage checksums
- Domain-specific detail

## Storage

Traces are stored on the local filesystem by default via `ReplayStore`:

```
governance/scgs/replay/traces/{traceId}.json
governance/scgs/replay/traces/{traceId}.events.jsonl
```

In production this should be backed by an object store or the SCGS database.

## Validation

`ReplayValidator` enforces:

1. Losslessness — recomputed events equal stored events.
2. PTS binding — every trace contains a `PTS_SHIFT` event.
3. CI binding — every trace contains a `CI_VERDICT` event.
4. Snapshot integrity — referenced snapshot files exist.
