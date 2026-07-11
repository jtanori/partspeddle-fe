# Catalog Governance Framework (P1.7)

**Goal**: Define authoritative ownership for marketplace concepts.

---

## 1. Ownership Model

| Concept Class | Owner | Definition Strategy |
| :--- | :--- | :--- |
| **Catalog Attributes** | Product Catalog Mgmt | Derived from OEM data, technical specs, and manufacturer catalogs. |
| **Marketplace Attributes** | Marketplace Operations | Derived from listing state (Condition, Warranty, Price, Location). |
| **Derived Metrics** | System Engine | Calculated via `TrustScoreEngine` (e.g., Rating, Trust Level). |

## 2. Governance Workflow
1. **Change Request**: Specification change is proposed via ADR.
2. **Review**: Platform Architect verifies against `PDP_CONTRACT_V1`.
3. **Approval**: Catalog Manager approves metadata; Platform Architect signs off on contract parity.
4. **Implementation**: Schema update + UI rebinding.

*Rule: No concept may be introduced without an identified Owner.*
