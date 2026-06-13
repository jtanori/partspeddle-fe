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
**Output**: `docs/ARCHITECTURAL_DRIFT_REPORT.md`
**Fail Condition**: Multiple authoritative implementations for a single subsystem.

---

# LEVEL 1 — SANITATION

Purpose: Repository hygiene (Dead code, Orphaned components, Dependencies).
**Output**: `docs/DEAD_CODE_REPORT.md`, `docs/COMPONENT_REACHABILITY.md`, `docs/DEPENDENCY_AUDIT.md`.

---

# LEVEL 2 — CERTIFIED ASSET PROTECTION (CAP)

Purpose: Prevent accidental deletion or modification of protected assets (Platinum contracts, tests, APIs).

## Stage C1: Asset Integrity Check

Verify all protected files listed in `docs/SYSTEM_OF_RECORD.md`.
**Fail Condition**: Modification or deletion of a protected asset without a justified entry in `docs/CERTIFIED_SYSTEM_CHANGELOG.md`.

## Stage C2: Deletion Classification

Every deleted file MUST be classified in `docs/DELETION_CLASSIFICATION.md`.

**Classifications**:

- **REPLACED**: Asset superseded by an authoritative replacement (Evidence required).
- **REMOVED**: Asset intentionally removed (Human Review Required).

---

# LEVEL 3 — PROMOTION

Purpose: Stability and runtime verification.
**Output**: `docs/PROMOTION_SNAPSHOT.md`.
**Zero Tolerance**: 100% test pass rate required.

---

# Promotion Gates & States

## Certification Statuses

1.  **PASS**: 100% compliance across all levels.
2.  **FAIL**: Direct violation of a requirement.
3.  **BLOCKED**: Failing tests or partial validations.
4.  **FROZEN**: **Human Review Required**. Triggered by `REMOVED` classification of certified assets or unexplained contract changes.

## Structured Human Sign-Off

To unfreeze a promotion, a human must provide a signed decision in `docs/PROMOTION_EXCEPTION.md`.

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
