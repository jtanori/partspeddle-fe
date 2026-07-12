# Phase 11 — Public Information Page System (IPS)

**Date:** 2026-07-09
**Branch:** `feat/phase-11-information-page-system`
**Base:** `develop`
**Goal:** Extend PPDS with a reusable **Information Page System (IPS)** and refactor all public editorial pages to use it.

---

## Problem Statement

The public information pages (`/about`, `/contact`, `/terms`, `/privacy`, `/salvage-network`, `/trust-verification`) were created as isolated page specs during Phase 10. Over time they will drift in layout, typography, spacing, and component usage. Phase 11 consolidates them into a single **Information Page System** inside PPDS.

---

## Scope

### In Scope

1. Define IPS in PPDS documentation.
2. Build reusable IPS components in `src/components/information-pages/`.
3. Refactor existing public pages to use IPS:
   - `/about`
   - `/contact`
   - `/terms`
   - `/privacy`
   - `/salvage-network`
   - `/trust-verification`
4. Update `docs/PPDS-AI-Design-Spec.md` with IPS components.
5. Add or update Storybook stories for new IPS components.
6. Add/update branch tests for IPS components and pages.

### Out of Scope

- New page content beyond what is specified below.
- Changes to the marketplace homepage or seller workspace.
- Backend API changes.

---

## PPDS Extension: Information Page System (IPS)

### Surface

Marketplace (Comfortable density).

### Shared Page Structure

```
Header (existing Navbar)
↓
Breadcrumb
↓
InformationPageHeader
↓
Main Content
↓
Optional Editorial CTA
↓
Footer (existing Footer)
```

No hero banner. Pages begin with a compact editorial page header.

---

## New IPS Components

| Component                     | Location                            | Purpose                                     |
| ----------------------------- | ----------------------------------- | ------------------------------------------- |
| `InformationPageHeader`       | `src/components/information-pages/` | Compact replacement for homepage Hero       |
| `InformationLayout`           | `src/components/information-pages/` | Two-column editorial layout (66/34 desktop) |
| `StickySidebar`               | `src/components/information-pages/` | Sticky sidebar container                    |
| `TableOfContents`             | `src/components/information-pages/` | Auto-generated TOC with active highlight    |
| `SupportCard`                 | `src/components/information-pages/` | CTA card for support/onboarding             |
| `RelatedLinksCard`            | `src/components/information-pages/` | Related resource navigation                 |
| `ContactMethodCard`           | `src/components/information-pages/` | Contact channel display                     |
| `NetworkStatisticCard`        | `src/components/information-pages/` | Network/metric highlight                    |
| `TrustFeatureCard`            | `src/components/information-pages/` | Trust feature explanation                   |
| `VerificationProcessTimeline` | `src/components/information-pages/` | Step-by-step verification workflow          |
| `EditorialSection`            | `src/components/information-pages/` | Long-form content section wrapper           |
| `InfoCallout`                 | `src/components/information-pages/` | Contextual callout panel                    |

### Design Tokens for IPS

Use existing PPDS tokens:

- **H1:** Display L (40px / 1.15)
- **Eyebrow:** Label (12px / bold uppercase tracking)
- **Body:** Body M (16px / 1.6)
- **Legal text:** Body M
- **Sidebar headings:** Heading S (18px / 1.35)
- **Page header spacing:** 64px top, 32px bottom
- **Page header max width:** 720px
- **Sidebar sticky top:** 120px
- **Sidebar card spacing:** 24px

---

## Page Specifications

### `/contact`

**Purpose:** Support center.

**Layout:**

```
InformationPageHeader
↓
4 ContactMethodCards
↓
InformationLayout
  Main: Contact form
  Sidebar: Mailing address, partnerships, trust, report listing
↓
FAQ Accordion
↓
Editorial CTA
```

**Page header:**

- Eyebrow: "SUPPORT"
- Title: "We're here to help."
- Description: "Have a question about an order, listing, seller account, or partnership? Our team is ready to connect you with the right people."

**Contact methods:** Fast Support, Phone, Email, Live Chat.

**Form fields:** Name, Email, Subject, Order Number (optional), Message.

**Sidebar:** Mailing Address, Partnerships, Trust, Report Listing.

### `/terms`

**Purpose:** Legal agreement.

**Layout:**

```
InformationPageHeader
↓
InformationLayout
  Main: Editorial sections
  Sidebar: Sticky TOC, SupportCard, RelatedLinksCard
```

**Sections:**

1. Acceptance
2. Eligibility
3. User Accounts
4. Listings
5. Marketplace Transactions
6. Payments
7. Shipping
8. Returns
9. Intellectual Property
10. Prohibited Conduct
11. Account Suspension
12. Disclaimer
13. Limitation of Liability
14. Changes
15. Contact

### `/privacy`

**Purpose:** Explain data practices.

**Layout:** Same as Terms.

**Sections:**

- Information We Collect (Account, Vehicle, Listing, Payment, Cookies, Analytics)
- How We Use Data
- Sharing
- Security
- Your Rights
- Data Retention
- Children
- International Users
- Contact

### `/salvage-network`

**Purpose:** Recruit recycling yards and demonstrate network strength.

**Layout:**

```
InformationPageHeader
↓
NetworkStatisticCards row
↓
TrustFeatureCards / Benefits grid
↓
VerificationProcessTimeline (How Network Works)
↓
Requirements list
↓
Map placeholder
↓
Editorial CTA
```

**Statistics:** 350+ Verified Yards, 2M+ Parts Listed, 50 States Coverage, Buyer Protection Included.

**Benefits:** Reach More Buyers, Inventory Sync, Business Dashboard, Shipping Tools, Marketplace Exposure, Analytics.

**Requirements:** Licensed recycler, Business verification, Valid tax information, Inventory quality standards.

### `/trust-verification`

**Purpose:** Explain why buyers should trust PartsPeddle.

**Layout:**

```
InformationPageHeader
↓
TrustFeatureCards
↓
VerificationProcessTimeline
↓
Trust metrics
↓
FAQ Accordion
↓
Editorial CTA
```

**Trust features:** Identity Verification, Business Validation, Fraud Monitoring, Marketplace Reviews, Buyer Protection, Secure Payments.

**Verification timeline:**

1. Identity Review
2. Business Verification
3. Inventory Review
4. Activation

**Trust metrics:** Verified Sellers, Buyer Satisfaction, Fraud Prevention, Response Times.

### `/about`

**Purpose:** Company information.

**Layout:**

```
InformationPageHeader
↓
EditorialSection(s)
↓
Optional team/company stats
↓
Editorial CTA
```

Content to be provided or adapted from existing `BrandStoryColumn` / brand copy.

---

## Shared Editorial CTA

Appears before footer on IPS pages.

- Dark background (homepage CTA style)
- Heading: "Need help finding the right part?"
- Body: "Our marketplace connects buyers with trusted sellers across North America."
- Buttons: "Search Parts", "Contact Support"

---

## Implementation Plan

### Phase A: Foundation

1. Create `src/components/information-pages/` directory.
2. Implement `InformationPageHeader`.
3. Implement `InformationLayout` and `StickySidebar`.
4. Implement `EditorialSection` and `InfoCallout`.
5. Add Storybook stories for foundation components.

### Phase B: Navigation & Cards

6. Implement `TableOfContents`.
7. Implement `SupportCard`, `RelatedLinksCard`.
8. Implement `ContactMethodCard`, `NetworkStatisticCard`, `TrustFeatureCard`.
9. Implement `VerificationProcessTimeline`.
10. Add Storybook stories.

### Phase C: Page Refactors

11. Refactor `/contact`.
12. Refactor `/terms`.
13. Refactor `/privacy`.
14. Refactor `/salvage-network`.
15. Refactor `/trust-verification`.
16. Refactor `/about`.

### Phase D: Documentation & Tests

17. Update `docs/design-system/06-component-library.md` with IPS components.
18. Update `docs/PPDS-AI-Design-Spec.md`.
19. Add/update branch tests.
20. Run local verification (typecheck, lint, tests, build).

---

## Acceptance Criteria

- [ ] All six public information pages render using IPS components.
- [ ] Visual consistency across all IPS pages (typography, spacing, color).
- [ ] Table of contents works on `/terms` and `/privacy`.
- [ ] Responsive behavior matches IPS spec (desktop 66/34, tablet stacked, mobile single column).
- [ ] Storybook stories exist for all new reusable components.
- [ ] Branch tests pass.
- [ ] `pnpm build` succeeds.
- [ ] `pnpm lint` passes.
- [ ] `pnpm typecheck` passes.

---

## Risks

- Existing `PublicInfoPage` component in `src/components/layout/PublicInfoPage.tsx` may overlap with IPS. Decide whether to deprecate or integrate.
- Content drift: legal copy in `/terms` and `/privacy` should be reviewed for accuracy before deployment.
- Timeline component may need accessibility attention (keyboard navigation, reduced motion).

---

## Related Files

- `src/app/(public)/about/page.tsx`
- `src/app/(public)/contact/page.tsx`
- `src/app/(public)/terms/page.tsx`
- `src/app/(public)/privacy/page.tsx`
- `src/app/(public)/salvage-network/page.tsx`
- `src/app/(public)/trust-verification/page.tsx`
- `src/components/layout/PublicInfoPage.tsx`
- `docs/design-system/06-component-library.md`
- `docs/PPDS-AI-Design-Spec.md`
