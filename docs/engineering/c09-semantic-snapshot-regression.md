# C.0.9 — Semantic Snapshot Regression System

## 1. Purpose

To detect silent semantic drift over time. While C.0.8 ensures _cross-system parity_ at a point in time, C.0.9 ensures _semantic stability over time_.

## 2. Invariant

> The semantic meaning of category `X` must be stable across codebase releases, or explicitly version-bumped via a required Semantic Changelog entry.

## 3. Mechanism

1.  **Snapshots**: On every `compile()` execution in test, serialize the output (`CompiledSpecificationSet`) to a JSON snapshot file: `tests/snapshots/semantic/<category_id>.json`.
2.  **Detection**: If `current_compilation !== stored_snapshot`:
    - The test fails immediately.
    - The error message provides a structural `diff` of the semantic changes.
    - The developer is forced to update the snapshot (`--update-snapshot`) _only_ after confirming the change in [`governance/certification/evidence/certified-system-changelog.md`](../../governance/certification/evidence/certified-system-changelog.md).

## 4. CI/CD Integration

- **Blocking**: Snapshot mismatch fails the CI build.
- **Workflow**:
  1.  Test fails due to snapshot mismatch.
  2.  Dev evaluates change in [`governance/certification/evidence/certified-system-changelog.md`](../../governance/certification/evidence/certified-system-changelog.md).
  3.  Dev runs `vitest -u` to update the snapshot.
  4.  Both the snapshot file and changelog entry are committed together.

This ensures that any semantic change is explicitly documented as part of the PR.
