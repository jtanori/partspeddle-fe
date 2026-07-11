# PDP v2: Comprehensive Visual & Technical Specification

## 1. Design Tokens (Master Registry)

| Category | Token | Value | Application |
| :--- | :--- | :--- | :--- |
| **Colors** | `pp-primary` | `#B87333` | Primary CTAs, active states, rust copper icons. |
| | `pp-surface` | `#F5F0EB` | Page background (cream). |
| | `pp-text` | `#1E1E1E` | Main headings, primary body text. |
| | `pp-success` | `#2E7D32` | "Good Fit" badges, shipping incentives. |
| | `pp-warning` | `#E65100` | Core charge notices, out-of-stock banners. |
| **Spacing** | `pp-gap` | `32px` | Grid gap between main sections. |
| | `pp-pad` | `24px` | Standard internal component padding. |
| **Radius** | `pp-card` | `8px` | Outer card rounding. |
| | `pp-atom` | `4px` | Buttons, badges, thumbnails. |
| **Typography**| `font-display` | font-black, uppercase | Headings (H1, H2, H3). |
| | `font-sans` | font-medium | Body, labels, metadata. |

---

## 2. Layout Architecture

### 2.1 Desktop (>= 1024px)
- **Grid:** 12-column CSS Grid.
- **Main Column:** `span 8` (70% approx).
- **Sidebar:** `span 4` (30% approx, sticky).
- **Hero Area:** Nested 2-column grid inside Main (Gallery: 1 / Info: 1).

### 2.2 Responsive Breakpoints
- **Tablet (768px - 1023px):** Single column. Sidebar modules collapse below main content.
- **Mobile (< 768px):** Single column. Gallery becomes swipeable. Padding reduced to `16px`.

---

## 3. Component Visual Guidelines

### 3.1 Product Gallery
- **Thumbnail Rail:** Vertical (left), 4 visible + overflow badge (+n).
- **Interaction:** Hover-to-zoom overlay (bottom-centered, dark-900/80 bg, rust icon).
- **Image:** Object-contain with white background to maintain aspect ratio integrity.

### 3.2 Product Header
- **Structure:** [Badge] -> [H1 Title] -> [Subtitle] -> [Meta Row (Stars/SKU)] -> [Tag Row].
- **Tags:** Gray-100 bg, black-800 text, uppercase, tracking-wider.

### 3.3 Pricing & CTAs
- **Price:** Large, tracking-tight.
- **Shipping:** Specific line for incentive (Green, "Free shipping to [Zip]").
- **Actions:** 
  - Primary: `ADD TO CART` (Solid pp-primary, shadow-lg).
  - Secondary: `BUY NOW` (White, black-2px-border).
  - Tertiary: `Add to Watchlist` (Text with heart icon).

### 3.4 Description & Fitment
- **Layout:** 2-column internal grid.
- **Description:** Bulleted list (list-disc) with "Read More" line-clamp toggle.
- **Fitment:** Table-style list with "Verified Fit" green indicator.

### 3.5 Tab System
- **Nav:** Horizontal, uppercase, tracking-[0.2em], underline indicator on active.
- **Specs Tab:** 2-column data grid + placeholder imagery to the right (grayscale, 50% opacity).

---

## 4. Data States & Variations

| State | UI Logic |
| :--- | :--- |
| **A: Complete** | Default state. All data visible. |
| **B: Out of Stock** | Replace CTAs with "FIND SIMILAR PARTS". Gray-out price. Show alert banner. |
| **C: Core Charge** | Inject orange card: `+$30.00 Core Charge`. Subtext: "Refundable upon return". |
| **D: Limited Data** | Show "Fitment not verified" banner. Hide optional attributes (Mileage). |

---

## 5. Sidebar Modules

### 5.1 Seller Card
- **Status:** "Gold Seller" badge (yellow-100 bg, rust text).
- **Support List:** Icon-list for Maps, Truck, and Returns.
- **Buyer Confidence:** Icon-list (Shield, Check, Lock) with italic subtext.

### 5.2 Compatible Parts
- **Format:** Small thumbnails, SKU-level detail, rust price.

### 5.3 Need Help
- **Interaction:** Button-style rows with "We're online now" status in emerald.

---

## 6. Implementation Checklist (Final Verification)

- [ ] All icons use `lucide-react`.
- [ ] No hardcoded colors (use Tailwind `pp-*` tokens).
- [ ] Sticky sidebar behavior on desktop.
- [ ] ViewModel binding for all dynamic text.
- [ ] 100% Vitest coverage for all states.
