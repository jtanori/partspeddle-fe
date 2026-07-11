# Delivery Operations

This directory contains the operational platform for delivering PartsPeddle / VinTrack.

## Purpose

The delivery operations subsystem defines:

- deployment environments and their metadata,
- deployment topology and rollback strategy,
- verification sequence (health checks, smoke tests),
- observability requirements for deployment records,
- recovery commands and runbook references,
- certification gates that must pass before production.

## Single source of truth

`operations/delivery/manifests/delivery.manifest.json` is the canonical descriptor.

CI, verification scripts, and documentation should derive operational facts from this manifest where practical.

## Directory layout

```text
operations/delivery/
  manifests/
    delivery.manifest.json          # canonical manifest
    delivery.manifest.schema.json   # JSON schema
    manifest.ts                     # TypeScript types and loader
  verification/                     # verification tooling (manifests/specs)
  recovery/                         # recovery artifacts
  observability/                    # observability schemas and specs
```

## Scripts

```bash
# Validate the delivery manifest
pnpm delivery:manifest:validate

# Verify a deployment against the manifest
pnpm deploy:verify --environment staging
pnpm ci:verify:staging
```

## Integration with CI

GitHub Actions reads the manifest indirectly through the package scripts. Future iterations may expose manifest values as workflow outputs so jobs can be driven entirely by `delivery.manifest.json`.
