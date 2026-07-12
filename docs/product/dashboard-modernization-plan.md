# Dashboard and Listing Platform Modernization Plans

## PLAN 1: Dashboard Modernization Program

### 1. Executive Objective

Transform the current dashboard from a collection of account pages into a unified Marketplace Operations Center serving Sellers (inventory, sales, orders, analytics) and Buyers (purchases, tracking, saved parts/searches).

### 2. Current State Analysis

- Current implementation is fragmented across multiple account-related pages.
- Lacks role-based unified operations view.

### 3. Gap Analysis

- Missing unified dashboard shell/layout.
- Missing unified ViewModel layer for dashboard aggregates.
- Fragmented navigation.

### 4. Domain Architecture

- Domain Models: `Dashboard`, `Inventory`, `Orders`, `Purchases`, `Analytics`, `Profile`.

### 5. ViewModel Contracts

- `DashboardViewModel` (Interface composition).
- `SellerDashboardViewModel`, `BuyerDashboardViewModel`.

### 6. Backend Requirements

- API endpoints for aggregated dashboard data.

### 7. Search / Index Impact

- Potential need for index views optimized for recent activities (orders, messages).

### 8. Frontend Architecture

- `DashboardLayout` (shared shell).
- Role-based navigation system.

### 9. Component Hierarchy

- Sidebar, Header, Content, Breadcrumbs, MetricCards, DataTables, etc.

### 10. Phased Implementation Plan

- Phase 0: Architecture Definition.
- Phase 1: Shared Dashboard Shell.
- Phase 2: Design System (Primitives).
- Phase 3: Seller Landing Page.
- Phase 4: Inventory Management.
- Phase 5: Buyer Dashboard.

### 11. TDD Requirements

- Component-level unit/integration tests (Navigation, Loading, Empty States).

### 12. Promotion Gates

- 100% navigation coverage.
- No visual regressions.
- All routes functional.

### 13. Production Readiness Certification

- Dashboard loads under 500ms cached, 1.5s uncached.

### 14. Future Expansion Considerations

- Role-based navigation extensibility.

---

## PLAN 2: Listing Creation Platform

### 1. Executive Objective

Create a structured, domain-driven listing pipeline that transforms seller input into marketplace-ready inventory data across all necessary subsystems.

### 2. Current State Analysis

- Fragmented/Manual listing processes.

### 3. Gap Analysis

- Missing structured listing pipeline.
- Data integrity check requirement for all listing stages.

### 4. Domain Architecture

- Pipeline: Listing Data ➝ Fitment ➝ Search ➝ PDP ➝ Marketplace Inventory.

### 5. ViewModel Contracts

- `CreateListingViewModel`, `FitmentViewModel`, `PricingViewModel`, `MediaViewModel`, etc.

### 6. Backend Requirements

- Persistence for draft states.
- Validation services (PartIdentification, Fitment).

### 7. Search / Index Impact

- Immediate indexing trigger upon publication.

### 8. Frontend Architecture

- Multi-step Wizard component.
- Draft persistence/recovery logic.

### 9. Component Hierarchy

- Wizard Layout, Step Navigation, Previewer.

### 10. Phased Implementation Plan

- Phases 0-9 (Wizard shell ➝ Identify ➝ Fitment ➝ Condition ➝ Pricing ➝ Media ➝ Review ➝ Drafts).

### 11. TDD Requirements

- Tests for step progression, validation, draft persistence, refresh recovery.

### 12. Promotion Gates

- Functional verification (Draft/Publish), Data integrity verification.

### 13. Production Readiness Certification

- Performance (Transition < 200ms, Publish < 2s).

### 14. Future Expansion Considerations

- Bulk upload platform, AI-Assisted Listing.
