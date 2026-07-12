# Product Detail Page (PDP) Production Readiness Certification (PRC)

## 1. Objective

Ensure the modernized PDP is resilient, performant, and secure before promotion to `main`.

## 2. Certification Gates

### Gate 1: Architectural Integrity (AIC)

- [ ] No architectural drift from [`../reference/search/source-of-truth.md`](../reference/search/source-of-truth.md) or [`pdp-modernization-plan.md`](pdp-modernization-plan.md).
- [ ] ViewModel dependencies mapped and verified.

### Gate 2: Sanitation (Level 1)

- [ ] No dead code in `src/components/pdp-modern/`.
- [ ] No unused legacy components imported by `PDPRoot`.

### Gate 3: Functional & Performance (Level 3)

- [ ] 100% test pass rate in `src/components/pdp-modern/tests/`.
- [ ] Performance metrics meet thresholds:
  - Initial Render < 200ms
  - Interaction Latency < 16ms
- [ ] No runtime `PGRST` errors or `undefined` prop access.

### Gate 4: Security (Level 2)

- [ ] Row Level Security (RLS) policies verified for `parts` and `seller_profiles` tables.
- [ ] No client-side database secrets.
- [ ] Secure Data Fetching (Server-side only).

## 3. Promotion Snapshot

- [ ] RPS (Regression Potential Score) calculated.
- [ ] Final certification report signed off.
