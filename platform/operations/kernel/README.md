# Operations Kernel

The Operations Kernel is the governance layer for delivery, runtime, and operational contracts in PartsPeddle. It mirrors the compiler-driven, certification-first philosophy already established by SCGS and the search module.

## Responsibilities

- **Contracts**: canonical definitions of operational contracts (health, deployment, etc.).
- **Verification**: scripts and logic that certify a deployment or runtime state.
- **Recovery**: rollback procedures and runbook references.
- **Certification**: gates, evidence, and completion criteria for operational readiness.
- **Manifests**: operational descriptors consumed by CI/CD and runtime tooling.
- **Runtime**: startup validation and runtime governance hooks.

## Design principles

1. **Contracts are code**. Every operational contract is expressed as a TypeScript module with a versioned schema.
2. **Single source of truth**. The delivery manifest (`platform/operations/delivery/manifests/delivery.manifest.json`) describes the topology; the kernel validates behavior against it.
3. **Fail fast**. Runtime validation refuses to start if required configuration or dependencies are missing.
4. **Certification before promotion**. No operational change reaches `develop` or `main` without evidence.

## Entry points

- `platform/operations/kernel/contracts/health.contract.ts` — `/api/health` contract and validator.
- `platform/scripts/deployment/verify-deployment.ts` — deployment verification (DC-6 + DC-6.5).
- `platform/scripts/deployment/assert-health-contract.ts` — one-shot health contract assertion for CI.
