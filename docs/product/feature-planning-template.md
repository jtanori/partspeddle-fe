# Feature Planning Template

This template must be used for all major feature initiatives to ensure architectural consistency, domain-driven design, and production readiness.

---

### 1. Executive Objective

- What is the specific business goal?
- What does success look like?

### 2. Current State Analysis

- What is the existing implementation (if any)?
- What are the limitations or technical debts?

### 3. Gap Analysis

- Data/API/Algolia requirements vs. current state.
- What needs to be mocked? What must be prioritized?

### 4. Domain Architecture

- Definition of core domain models.
- Boundary definitions (Listing, Part, Inventory, Seller, etc.).

### 5. ViewModel Contracts

- TypeScript interfaces for ViewModels.

### 6. Backend Requirements

- DB Schema updates, API endpoint changes.

### 7. Search / Index Impact

- New facets, searchable fields, or ranking changes.

### 8. Frontend Architecture

- Layout strategy (Desktop vs. Mobile).
- Component composition strategy.

### 9. Component Hierarchy

- Atomic breakdown.

### 10. Phased Implementation Plan

- Phased roadmap (Phase 0, 1, 2, etc.).

### 11. TDD Requirements

- Testing strategy (Unit, Integration, E2E).

### 12. Promotion Gates

- Certification levels required.

### 13. Production Readiness Certification

- Definition of "Production Certified" vs "Unrestricted Production Certified".

### 14. Future Expansion Considerations

- What are we preparing for? (e.g., cross-market scaling, AI features).
