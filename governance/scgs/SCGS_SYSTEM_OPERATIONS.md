# SCGS System Operations Manual (SOM)

This document defines the **Operational Operating Model** for the SCGS + CCC + PTS architecture. Adherence to these protocols is mandatory for all engineers working within the catalog domain.

---

## 1. Core Operational Philosophy

The system is a **closed-loop semantic execution environment**.
*   **The Compiler** is the sole source of semantic truth.
*   **The SCGS Pipeline** is the sole validator of semantic correctness.
*   **Engineers** must behave as observers of this governed system, not active interpreters of domain logic.

---

## 2. Incident Response Protocol (CI = BLOCK)

When a CI build fails with an `SCGS_BLOCK` verdict, engineers **MUST** follow this workflow:

1.  **Capture**: Retrieve the `traceId` from the CI logs.
2.  **Load**: Invoke the Replay system: `npm run scgs:replay:validate -- --traceId=<ID>`.
3.  **Analyze**: 
    *   Inspect `CI_VERDICT` event.
    *   Traverse `GROUP_CHANGE` and `FACET_CHANGE` diff chain in order.
    *   Identify the earliest event in the `SemanticReplayTrace` where the artifact diverged from the previous stable snapshot.
4.  **Remediate**: 
    *   ❌ **FORBIDDEN**: Modifying UI code to "fix" the output.
    *   ❌ **FORBIDDEN**: Manual recomputation of specifications.
    *   ✅ **REQUIRED**: Update `SpecificationCompiler` to resolve the semantic divergence or adjust `GovernancePolicy` if the change is intentional and permitted.

---

## 3. Replay Usage Protocol (Forensics Only)

The Replay system is an immutable forensic ledger.

*   **Allowed**: Step-by-step causal inspection, root cause tracing, PTS validation.
*   **Forbidden**: "What-if" editing, manual recomputation, modified simulation. Replay data is non-negotiable proof.

---

## 4. Change Introduction Protocol

All semantic changes require the following sequence before a Pull Request is eligible for review:

1.  **Compile**: `npm run scgs:compile`
2.  **Predict**: `npm run scgs:pts:compute` (Check `driftScore`)
3.  **Certify**: `npm run scgs:prr` (Ensure all 14 clauses pass)
4.  **Validate**: `npm run scgs:ci:enforce` (End-to-end verification)

**PRs without passing `scgs:prr` artifacts will be automatically rejected.**

---

## 5. Dashboard Interpretation Rules

The Semantic Health Dashboard (`/scgs/dashboard`) is a **pure projection layer**.

*   **StabilityIndex**: A backward-looking aggregate only. Do not use for real-time drift troubleshooting.
*   **DriftTrend**: A comparative history only.
*   **BLOCK**: An authoritative CI decision. It cannot be overridden by UI state or perceived "stability."

---

## 6. Human Mental Model: "Thinking in SCGS"

Engineers must shift their cognitive model:

*   **Think in**: Artifacts, Traces, Diffs, Vectors, Verdicts.
*   **Stop thinking in**: "Search behavior," "UI grouping logic," "Facet rules."

These concepts no longer exist as runtime code paths—they are compiled semantic artifacts.

---

## 7. Forbidden Operational Behaviors

| Behavior | Risk | Penalty |
| :--- | :--- | :--- |
| **Bypassing SCGS** | Semantic drift re-introduction | **CRITICAL FAILURE** |
| **Hardcoding logic in UI** | Architectural entropy | **BLOCK / REJECT** |
| **Treating Replay as Mutable** | Loss of forensic integrity | **Causal Ledger Corruption** |
| **Ignoring PTS warnings** | Proactive drift accumulation | **System Instability** |

---

## 8. Final Directive

This constitution is not a recommendation—it is the **operating model of the system**. If the code requires an interpretation surface, you must first propose a governance change to the SCGS compiler, not a patch in the consumer layer.
