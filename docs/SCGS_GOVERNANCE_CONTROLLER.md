# SCGS Governance Controller: Behavioral Contract

This document defines the **Operational Behavior Mapping** for the SCGS+CCC+PTS system. The `GovernanceController` enforces these rules to ensure human actions remain aligned with system state.

## 1. System States & Behavioral Responses

| System State | Enforcement Level | Allowed Actions | Forbidden Actions |
| :--- | :--- | :--- | :--- |
| **STABLE** | `NONE` | Standard Development, PR flow | None |
| **DEGRADED** | `REVIEW` | Compiler changes, Replay inspection | Silent UI changes, Schema mutation |
| **DRIFTING** | `BLOCK` | SCGS-aligned fixes, Replay inspection | Non-SCGS aligned changes |
| **BLOCKED** | `BLOCK` | Replay debugging only | Projection/UI Changes |
| **INCONSISTENT** | `BLOCK` | Compiler kernel fixes only | All downstream writes |

---

## 2. Operational Invariants

1.  **Strict Adherence**: When a system state is `DRIFTING` or `BLOCKED`, the CI/CD pipeline and the `GovernanceController` will prevent non-compliant engineering actions.
2.  **Deterministic Response**: The response contract is fixed. Engineers may not negotiate behavior based on perceived urgency.
3.  **Governance Priority**: If a `BLOCK` state is reached, all downstream development must cease until the `SpecificationCompiler` kernel is reconciled.

---

## 3. Implementation of the Contract

This behavior is enforced via `src/domain/specification/scgs/controller.ts`. All automated tooling (CI runners, CLI tools) must consume this controller to provide guidance on permitted actions based on the current `SystemState`.
