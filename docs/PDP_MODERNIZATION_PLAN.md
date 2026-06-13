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
- **Fitment Badge**: Small, rounded green-tinted badge at the top (e.g., `✓ GOOD FIT`).
- **Title**: Large, bold main title (e.g., `2015 Honda Civic Alternator`).
- **Subtitle**: Smaller, secondary text for engine details (e.g., `1.8L, 4-Cylinder`).
- **Meta-data Row**:
    - **Rating**: Stars + count (e.g., `★★★★☆ (128)`).
    - **SKU**: Text label with ID (e.g., `SKU: ALT-11039`).
- **Tags/Attribute Row**:
    - Row of distinct gray-background badges for quick part attributes:
        - `OEM`
        - `160,000 Miles`
        - `Tested`
        - `Warranty Included`


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

## 4. Description & Fitment Panel
- **Layout**: Two-column grid.
- **Description Column**: 
    - Paragraph text.
    - Bulleted list of features.
    - "Read more" interaction link.
- **Vehicle Fitment Column**:
    - Header with checkmark icon (e.g., `✓ This part fits the following vehicles`).
    - List of vehicles (Year Make Model, Engine detail).
    - Footer link: "View all N compatible vehicles".

## 5. Specification Tabs
- **Tabbed Interface**: Horizontal tab navigation (Specifications, Fitment, Description, Shipping & Returns, Warranty, Q&A).
- **Layout**: 
    - Two-column grid for key-value specification pairs.
    - Visual element: Product imagery displayed to the right of the spec list in the "Specifications" tab.

## 6. Trust Bar
- **Layout**: Horizontal, single-row container with four icons/text pairs.
- **Content**: 
    - **Secure Checkout**: Lock icon, "SSL encrypted".
    - **30-Day Returns**: Refresh icon, "Easy return policy".
    - **Warranty Included**: Shield icon, "90-day warranty".
    - **Support**: Chat/Help icon, "Contact us anytime".


---

## 8. Sidebar Modules
The sidebar is a sticky vertical stack of modular cards.

### 8.1 Seller & Support Card
- **Header**: "Seller & Support".
- **Seller Profile**: Business name, Gold/Silver status badge, star rating, and review count.
- **Support List**: Icon-based list with detailed text:
    - Ships from location.
    - Delivery ETA window.
    - 30-day return policy detail.
- **Buyer Confidence Section**:
    - Header: "Buyer Confidence".
    - Icon-list of trust signals: 90-day warranty, quality tested, secure checkout, 30-day returns.

### 8.2 Compatible Parts (Cross Sell)
- **Header**: "Compatible Parts (Cross Sell)".
- **List Items**:
    - Small product image.
    - Title + SKU/Part Number.
    - Price.
- **Footer**: Link "View more compatible parts (N)".

### 8.3 Recently Viewed
- **Header**: "Recently Viewed".
- **List Items**:
    - Small product image.
    - Title.
    - Price.
- **Footer**: Link "View all recently viewed".

### 8.4 Need Help
- **Header**: "Need Help?".
- **Items**: Icon-based list with contact info:
    - Live Chat ("We're online now").
    - Call Us (Phone number).
    - Email Us (Email address).
    - Hours (e.g., Mon - Fri: 8AM - 6PM EST).


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

# 12. State Matrix & Logic

## 12.1 Data States (Main Content Variations)

| State | Variation | UI Logic / Display Requirements |
| :--- | :--- | :--- |
| **A** | **Complete (In Stock)** | Full gallery, all badges, price + shipping, "In Stock" badge, primary "ADD TO CART". |
| **B** | **Out of Stock** | Same header, price visible. Replace "ADD TO CART" with "FIND SIMILAR PARTS". Display "OUT OF STOCK" error banner. |
| **C** | **Core Charge** | Injects an orange background warning card beneath the price: `+$30.00 Core Charge` / `Refundable core charge`. |
| **D** | **Limited Data** | "Fitment not verified" warning banner below the price. Reduced attributes in header (hide mileage if N/A). |

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

### Phase 0 — Infrastructure & Domain
- Phase I of Vite Decommissioning: Tailwind Native Migration.
- Domain Contract Design (PartViewModel, PricingViewModel, etc.).

### Phase 1 — Repository & Domain Definition
- Repository layer implementation.
- ViewModelBuilder implementation.

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

---

# 15. Visual Component Specifications

## 1. Product Gallery
- **Layout**: Vertical thumbnail rail on the left; main display on the right.
- **Thumbnail Rail**:
    - Thumbnails stacked vertically.
    - Overflow indicator: "+n" badge (e.g., "+7") on the last visible thumbnail.
- **Main Display**:
    - Includes a persistent "Hover to zoom" action button overlay.
    - Thumbnail interaction: Clicking a thumbnail updates the main view.

## 2. Pricing Block
- **Price Display**: Large, bold price.
- **Shipping Info**:
    - Base shipping cost line (e.g., `+ $15.99 Shipping`).
    - Incentive line (green color, e.g., `Free shipping to 12345`).
- **CTA Actions**:
    - **ADD TO CART**: Solid orange primary button.
    - **BUY NOW**: Outlined/Neutral secondary button.
    - **Add to Watchlist**: Text link with heart icon below the secondary button.

---

# 17. Reserved/Handy Components
*These components are documented for future flexibility but are not currently slated for active implementation.*

## 17.1 Seller Ribbon
- **Layout**: Horizontal, full-width container (often sticky).
- **Content**:
    - **Seller Identity**: Avatar/logo, business name, and verification status badge.
    - **Performance**: Star rating and review count.
    - **Logistics/Quick Info**: Location, shipping origin, and return policy overview.
- **Style**: Subtle background (`#F5F0EB`) with distinct border, designed to stand out as a persistent seller identity anchor.

---

# 18. Design Tokens & Responsive Strategy

## 18.1 Responsive Behavior
- **Mobile (< 768px)**: 
    - **Layout**: Single-column stack.
    - **Gallery**: Swipeable carousel (thumbnails shift to bottom or are hidden).
    - **Sidebar**: Sidebar modules collapse into the main content flow, placed below the main gallery/header.
    - **Sticky Elements**: Only the CTA "Add to Cart" button remains sticky at the bottom.
- **Desktop (>= 1024px)**: 
    - **Layout**: 2-column grid (70% main / 30% sidebar).
    - **Sidebar**: Sidebar modules (`SellerCard`, `Need Help`) become sticky with a top margin.

## 18.2 Design Tokens
| Category | Token/Property | Value | Notes |
| :--- | :--- | :--- | :--- |
| **Colors** | Primary | `#B87333` | Rust Copper |
| | Surface | `#F5F0EB` | Base Cream |
| | Text | `#1E1E1E` | Main Heading |
| **Spacing** | Gap (Content) | `32px` | Grid gap |
| | Padding (Card) | `24px` | Standard module padding |
| **Typography**| Heading | `font-display` | Bold/Black, Uppercase |
| | Body | `font-sans` | Regular/Medium |
| **Radius** | Cards | `8px` | Standard rounding |
