# PDP Baseline Audit: Implementation State Inventory (P0)

**Date**: June 13, 2026  
**Auditor**: Gemini CLI Agent  
**Methodology**: Deterministic Inventory of Hardcoding & Architectural Drift

---

## 1. Executive Summary
The PDP Modernization has achieved a high-fidelity visual state but is currently **disconnected from the System of Record**. Approximately **85% of marketplace-specific text** is currently hardcoded within the React components. The `PartViewModel` is shallow and does not represent the complexity of the catalog design.

---

## 2. Component-Level Hardcoding Audit

| Component | Hardcoded Literals / Business Logic |
| :--- | :--- |
| **PDPRoot** | Breadcrumb labels ("Home", "Search results"); OOS/Limited Data banner logic; **100% of "Buyer Confidence" module** (Warranty, Quality, Security, Returns). |
| **ProductHeader** | "Good Fit" label; "SKU:" prefix; "160,000 MILES" tag; "OEM", "Tested", "Warranty Included" strings. |
| **PriceBlock** | Shipping logic (`includes('Free')`); Hardcoded zip ("12345"); OOS subtext; Core Charge description; **All CTA labels** (Add to Cart, Buy Now, Watchlist). |
| **TrustSummary** | **100% Hardcoded**: "Ships From NC, USA", "Est. Delivery Jun 5-9", "30-Day Returns". |
| **TabSystem** | **100% Hardcoded Spec Grid**: Labels (Condition, Mileage, Brand, Voltage, Amperage, Pulley) and Values ("Used OEM", "Denso", "12V"). |
| **DescriptionPanel** | "Description" & "Fitment" titles; Feature list items ("OEM quality", "Built to meet..."); Fitment checkmark text; Hardcoded fallback count (12). |
| **SellerCard** | "Gold Seller" badge text; Logistics labels (Ships from, ETA); Return policy subtext ("Buyer pays return shipping"). |
| **NeedHelp** | **100% Hardcoded**: Status ("We're online now"), Phone, Email, Hours. |
| **TrustBar** | **100% Hardcoded**: "Secure Checkout", "30-Day Returns", "Warranty Included", "Support". |

---

## 3. ViewModel Integrity Audit

### 3.1 Gaps in `PartViewModel`
- **Missing Structured Specs**: Currently uses `tabs: TabViewModel[]` where `content` is an opaque `any`. Needs a `SpecItem[]` array.
- **Missing Rich Trust**: `SellerViewModel` only contains `rating`. Needs `trustScore`, `feedbackPercentage`, `reviewCount`, and `badgeLevel`.
- **Missing Delivery Logic**: No structured fields for `shipsWithinDays` or `returnWindow`.

### 3.2 Drift in `PartViewModelBuilder`
- **Mock Overload**: Hardcodes `rating: 4.8`, `ratingCount: 128`, `responseTime: '24h'`, `shippingEstimate: 'Free shipping to 12345'`.
- **Enum Stalling**: Maps `part.condition === 'NEW'` to `isOEM` but lacks a translation layer for all 6 part conditions.
- **Spec Neglect**: Generates static strings ("Specs Data") instead of category-aware attribute arrays.

---

## 4. Architectural Drift Assessment

- **Violation of SEARCH_SOURCE_OF_TRUTH**: The PDP uses different rating/trust logic than the search results.
- **Violation of Marketplace Domain Rules**: Business logic for OOS and fitment confidence is leaking into the presentation layer (`PDPRoot.tsx`).
- **Data Sovereignty Failure**: There is no authoritative owner for the "Ships From" or "ETA" strings; they are currently owned by the UI.

---

## 5. Audit Conclusion
**STATUS: FAILED CERTIFICATION**  
The implementation is a "Visual Shell". No further UI development is permitted until **Phase P1 (Schema)** and **Phase P2 (Domain)** address the identified data gaps.

---
**Signed**,  
*Gemini CLI Agent*
