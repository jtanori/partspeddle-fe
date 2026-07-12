# Phase 11b — Editorial & Information Page Archetypes

**Date:** 2026-07-09
**Branch:** `feat/phase-11-information-page-system`
**Goal:** Elevate PPDS from a component library to a page-composition system by defining reusable Editorial Page Archetypes.

---

## Problem

IPS provides components, but coding agents still have to invent layouts for each new editorial page. Enterprise design systems (IBM Carbon, Atlassian, Shopify Polaris, GitHub Primer) solve this with canonical page archetypes.

---

## Archetypes

### A — Simple Editorial

- **Best for:** About, Careers, Shipping, Returns, Blog Articles
- **Structure:** Breadcrumb → Page Header → single centered article column (720–760px) → CTA → Footer
- **No sidebar**, comfortable spacing, optional inline media/quote

### B — Documentation

- **Best for:** Terms, Privacy, Seller Policies, API Docs, Marketplace Rules
- **Structure:** Breadcrumb → Header → two-column layout (article + sticky TOC sidebar) → CTA → Footer
- **Sidebar:** auto TOC, support card, related resources

### C — Support Center

- **Best for:** Contact, Help Center, Customer Service
- **Structure:** Breadcrumb → Header → contact-method cards → two-column (form + details sidebar) → FAQ accordion → CTA → Footer
- **Action-oriented**, forms first, multiple contact channels

### D — Feature Explanation

- **Best for:** Trust Verification, Buyer Protection, Escrow, Authentication, How It Works
- **Structure:** Breadcrumb → Header → feature grid → timeline → metrics → FAQ → CTA → Footer
- **Marketing + educational**, icons, timelines, statistics, callouts

### E — Program / Network Landing

- **Best for:** Salvage Network, Seller Program, Fleet Program, Enterprise
- **Structure:** Breadcrumb → Header → statistics → benefits grid → requirements → how it works → CTA → Footer
- **Conversion-oriented**, KPIs, requirements, application CTA

### F — FAQ / Knowledge Base

- **Best for:** Help Center, Buyer Guide, Seller Guide
- **Structure:** Breadcrumb → Header → search → categories → accordion → "Still Need Help" card → Footer
- **Searchable**, accordions, knowledge organization

### G — Comparison / Trust

- **Best for:** Buyer confidence pages
- **Structure:** Header → trust metrics → comparison table → process timeline → FAQ → CTA → Footer
- **Demonstrates why** the marketplace is trustworthy

---

## Layout Selection Matrix

| Page               | Archetype |
| ------------------ | --------- |
| About              | A         |
| Contact            | C         |
| Terms              | B         |
| Privacy            | B         |
| Trust Verification | D + G     |
| Salvage Network    | E         |
| Help Center        | F         |
| Returns            | A         |
| Shipping           | A         |
| Seller Guide       | F         |
| Buyer Protection   | D         |

---

## Work Items

1. Create `docs/design-system/09-editorial-page-archetypes.md`.
2. Add `ArchetypeLayout` helpers in `src/components/information-pages/`:
   - `SimpleEditorialLayout`
   - `DocumentationLayout`
   - `SupportCenterLayout`
   - `FeatureExplanationLayout`
   - `ProgramLandingLayout`
   - `KnowledgeBaseLayout`
   - `ComparisonTrustLayout`
3. Refactor existing IPS pages to use the appropriate archetype layout.
4. Add missing components:
   - `ComparisonTable`
   - `FAQSearch`
   - `KnowledgeBaseGrid`
5. Update `docs/PPDS-AI-Design-Spec.md` with archetypes.
6. Add Storybook stories and branch tests.

---

## Acceptance Criteria

- [ ] All six current public pages derive from a documented archetype.
- [ ] New archetype layouts are available for future pages.
- [ ] Docs are updated.
- [ ] Storybook + tests added.
