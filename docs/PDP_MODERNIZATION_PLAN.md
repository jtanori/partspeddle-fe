# Parts Detail Page Modernization Integration Plan

## Production Integration Specification (PDP v2)

### Objective

Replace the current Part Detail Page with the new catalog-style experience while:

- Preserving existing routing
- Preserving existing API contracts
- Preserving existing database schema
- Preserving existing search → PDP navigation
- Preserving SEO structure
- Preserving SPCS Platinum Certification requirements

This is a presentation-layer modernization project.

No backend architectural changes are required.

---

# 1. Architecture Strategy

## Current

```text
Search Results
    │
    ▼
Part Detail Route
    │
    ▼
Part Data
    │
    ▼
Current PDP
```

## Target

```text
Search Results
    │
    ▼
Part Detail Route
    │
    ▼
Part Data Adapter
    │
    ▼
PDP Layout Engine
    │
    ├── Gallery
    ├── Product Header
    ├── Pricing
    ├── Seller
    ├── Description/Fitment
    ├── Tabs
    ├── Cross Sell
    ├── Recently Viewed
    ├── Support
    └── Trust Bar
```

---

# 2. Routing Requirements

## Existing Route

Must remain unchanged.

Example:

```text
/parts/[id]
```

or

```text
/part/[slug]
```

depending on implementation.

No route migrations.

No URL changes.

No redirect logic.

---

## Search Integration

Current:

```text
Search Result Card
      │
      ▼
Part Detail Page
```

Must continue working unchanged.

---

## Canonical URLs

Must remain:

```html
<link rel="canonical" />
```

compatible.

No SEO changes.

---

# 3. Layout Architecture

---

## Desktop Layout

```text
┌─────────────────────────────────────────────┬──────────────┐
│                                              │              │
│ Gallery                                      │ Seller       │
│                                              │ Support      │
│ Product Information                           │              │
│                                              │ Cross Sell   │
│                                              │              │
│ Trust Summary Strip                          │ Recently     │
│                                              │ Viewed       │
├─────────────────────────────────────────────┤              │
│ Description      │ Vehicle Fitment          │ Support      │
├─────────────────────────────────────────────┴──────────────┤
│ Tab Navigation                                            │
├────────────────────────────────────────────────────────────┤
│ Tab Content                                                │
├────────────────────────────────────────────────────────────┤
│ Trust Bar                                                  │
└────────────────────────────────────────────────────────────┘
```

---

## Width Allocation

### Main Column

```text
70%
```

### Sidebar

```text
30%
```

Maximum:

```css
320px
```

Minimum:

```css
280px
```

---

# 4. Component Hierarchy

## PDPRoot

Top-level page composition.

Responsibilities:

```text
Layout only
```

No business logic.

---

## ProductGallery

Contains:

```text
Main Image
Thumbnail Rail
Zoom Action
Image Counter
```

---

### States

#### Complete

```text
5+ Images
```

#### Limited

```text
1 Image
```

Hide rail.

---

#### No Images

Display:

```text
OEM Placeholder
```

---

## ProductHeader

Contains:

```text
Title
Vehicle
SKU
Rating
Badges
```

---

### Badges

Supported:

```text
OEM
Used OEM
Aftermarket
Tested
Warranty Included
Good Fit
Verified Fit
```

Dynamic rendering.

---

## PriceBlock

Contains:

```text
Price
Shipping
Core Charge
Actions
```

---

### State A

Normal

```text
$89.99
```

---

### State B

Core Charge

```text
$89.99
+$30 Core Charge
```

Special warning card.

---

### State C

Out of Stock

Replace:

```text
Add To Cart
```

with:

```text
Find Similar Parts
```

---

## SellerSupportCard

Contains:

```text
Seller
Rating
Location
ETA
Return Policy
```

---

### Data Source

Current Seller model.

No new APIs.

---

# 5. Description + Fitment Panel

New component.

---

## Layout

```text
┌───────────────────┬───────────────────┐
│ Description       │ Vehicle Fitment   │
└───────────────────┴───────────────────┘
```

---

## Description

Display immediately.

No tab click required.

Purpose:

```text
Instant confidence
```

---

### Collapse Logic

If:

```text
> 400 characters
```

Show:

```text
Read More
```

---

## Vehicle Fitment

Display:

```text
Year
Make
Model
Engine
```

---

### State A

Verified Fitment

Show:

```text
✓ Fits These Vehicles
```

---

### State B

Limited Fitment

Show:

```text
Fitment Not Verified
```

Warning state.

---

# 6. Tab System

Tabs now become secondary information.

---

## Tab Order

```text
Specifications
Fitment
Description
Shipping & Returns
Warranty
Q&A
```

---

## Default

```text
Specifications
```

---

## Lazy Loading

Only render active tab content.

---

# 7. Specifications Module

Reusable component.

---

## Layout

```text
Label | Value
```

grid.

---

## Dynamic Fields

Only render populated values.

Example:

```text
Voltage
Amperage
Rotation
Pulley Type
```

may not exist.

---

## Empty Values

Never show:

```text
N/A
```

Hide row.

---

# 8. Sidebar Module Stack

---

## Order

```text
Seller & Support

Compatible Parts

Recently Viewed

Need Help
```

---

### Compatible Parts

Cross-sell component.

Source:

```text
same category
same vehicle
same manufacturer
```

---

### Recently Viewed

Local storage driven.

Maximum:

```text
5
```

---

### Need Help

Static component.

Contains:

```text
Live Chat
Phone
Email
Hours
```

---

# 9. Trust Summary Strip

Position:

Directly under product hero.

---

## Items

```text
Seller Rating
Ships From
Delivery ETA
Returns
```

---

Purpose:

Reduce friction before scrolling.

---

# 10. Trust Bar

Position:

Bottom of page.

Always visible before footer.

---

## Items

```text
Secure Checkout

30-Day Returns

Warranty Included

Support
```

---

## Behavior

Desktop:

```text
Horizontal
```

Tablet:

```text
2x2 Grid
```

Mobile:

```text
Stacked
```

---

# 11. Data Adapter Layer

Create:

```ts
PartViewModel;
```

---

## Input

Current API response.

---

## Output

```ts
interface PartViewModel {
  id: string;

  title: string;

  sku?: string;

  images: string[];

  price: number;

  shippingCost?: number;

  coreCharge?: number;

  isOutOfStock: boolean;

  seller: SellerVM;

  fitment: FitmentVM[];

  specifications: SpecificationVM[];

  description?: string;

  crossSell: PartSummaryVM[];
}
```

---

# 12. State Matrix

## Complete Data

Everything present.

Full layout.

---

## Limited Data

Missing:

```text
Description
Specifications
Fitment
```

Hide sections gracefully.

No empty cards.

---

## Out Of Stock

Actions become:

```text
Find Similar Parts
Save Search
```

---

## Core Charge

Additional pricing card.

Highlighted.

---

## No Images

Placeholder state.

---

# 13. Analytics

Track:

```text
Image Viewed
Thumbnail Selected
Read More Clicked
Fitment Expanded
Cross Sell Clicked
Recently Viewed Clicked
Contact Support Clicked
Add To Cart
Buy Now
```

---

# 14. Certification Requirements

### Functional

- [ ] Existing PDP routes unchanged
- [ ] Existing search navigation unchanged
- [ ] Existing cart integration unchanged
- [ ] Existing seller integration unchanged

### Layout

- [ ] Complete Data state verified
- [ ] Limited Data state verified
- [ ] Out Of Stock state verified
- [ ] Core Charge state verified

### Performance

- [ ] Initial render < 200ms
- [ ] Gallery interaction < 16ms
- [ ] Tab switch < 16ms

### Regression

- [ ] Search → PDP flow unchanged
- [ ] PDP → Cart flow unchanged
- [ ] PDP SEO unchanged
- [ ] Mobile layout unchanged

---

# Recommended Implementation Order

### Phase 1 — View Model & Layout Foundation

- PartViewModel
- PDPRoot
- Desktop layout grid
- Sidebar stack

### Phase 2 — Hero Experience

- Gallery
- ProductHeader
- PriceBlock
- SellerSupportCard
- Trust Summary Strip

### Phase 3 — Content Modules

- Description/Fitment panel
- Tabs
- Specifications

### Phase 4 — Commerce Enhancements

- Compatible Parts
- Recently Viewed
- Need Help
- Trust Bar

### Phase 5 — Certification & Regression Testing

- State matrix validation
- Responsive validation
- Search integration validation
- Cart flow validation
