# PRE-PROMOTION SANITATION CERTIFICATION (PPSC)

## Certification Objective

Before any code is promoted:

```text
feature branch
    ↓
LEVEL 0: AIC (ARCHITECTURAL INTEGRITY)
    ↓
LEVEL 1: SANITATION
    ↓
LEVEL 2: CAP (CERTIFIED ASSET PROTECTION)
    ↓
LEVEL 3: PROMOTION
    ↓
Merge
```

---

# LEVEL 0 — ARCHITECTURAL INTEGRITY (AIC)

Purpose: Prevent AI-generated architectural drift (parallel implementations, shadow repositories).
**Output**: `docs/archive/architectural-drift-report.md`
**Fail Condition**: Multiple authoritative implementations for a single subsystem.

---

# LEVEL 1 — SANITATION

Purpose: Repository hygiene (Dead code, Orphaned components, Dependencies).
**Output**: `docs/archive/dead-code-report.md`, `docs/engineering/component-reachability.md`, `docs/archive/dependency-audit.md`.

---

# LEVEL 2 — CERTIFIED ASSET PROTECTION (CAP)

Purpose: Prevent accidental deletion or modification of protected assets (Platinum contracts, tests, APIs).

## Stage C1: Asset Integrity Check

Verify all protected files listed in [`../engineering/system-of-record.md`](../engineering/system-of-record.md).
**Fail Condition**: Modification or deletion of a protected asset without a justified entry in [`../../governance/certification/evidence/certified-system-changelog.md`](../../governance/certification/evidence/certified-system-changelog.md).

## Stage C2: Deletion Classification

Every deleted file MUST be classified in `docs/archive/deletion-classification.md`.

**Classifications**:

- **REPLACED**: Asset superseded by an authoritative replacement (Evidence required).
- **REMOVED**: Asset intentionally removed (Human Review Required).

---

# LEVEL 3 — PROMOTION

Purpose: Stability and runtime verification.
**Output**: `docs/archive/promotion-snapshot.md`.
**Zero Tolerance**: 100% test pass rate required.

---

# Promotion Gates & States

## Certification Statuses

1.  **PASS**: 100% compliance across all levels.
2.  **FAIL**: Direct violation of a requirement.
3.  **BLOCKED**: Failing tests or partial validations.
4.  **FROZEN**: **Human Review Required**. Triggered by `REMOVED` classification of certified assets or unexplained contract changes.

## Structured Human Sign-Off

To unfreeze a promotion, a human must provide a signed decision in `docs/archive/promotion-exception.md`.

Example:

```md
# PROMOTION EXCEPTION

Asset: search-api.test.ts
Reason: Coverage moved to consolidated certification suite.
Replacement: tests/certification/search-platform.spec.ts
Approved By: Jaime
Date: 2026-06-10
```

## Regression Potential Score (RPS)

Calculated in `PROMOTION_SNAPSHOT.md`. High RPS (>50) requires extra scrutiny.
