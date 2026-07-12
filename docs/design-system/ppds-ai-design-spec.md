# PartsPeddle Product Design System (PPDS) — AI Design Spec

Use this document with AI-assisted design tools (ChatGPT, Gemini, Claude, etc.) to generate new UI designs, mockups, or frontend implementations that are consistent with the PartsPeddle marketplace and workspace experiences.

---

## 1. Brand Essence

- **Product:** PartsPeddle — a marketplace for automotive parts, especially salvage, classic, and hard-to-find components.
- **Personality:** Direct, helpful, industrial, trustworthy. No fluff.
- **Visual tone:** Clean, editorial marketplace meets dense productivity workspace. Warm neutrals with a copper/terracotta brand accent.
- **Two primary surfaces:**
  1. **Marketplace** — public, buyer-facing, editorial, comfortable density.
  2. **Workspace** — seller/admin-facing, productivity-oriented, compact/dense density.

---

## 2. Color System

Use semantic tokens. Never use raw hex values in components.

### Brand

| Token                         | Hex       | Usage                           |
| ----------------------------- | --------- | ------------------------------- |
| `--color-brand-primary`       | `#b87333` | Primary buttons, links, accents |
| `--color-brand-primary-hover` | `#a35d1f` | Hover states                    |
| `--color-brand-cream`         | `#f5f0eb` | Soft backgrounds                |

### Surface

| Token                       | Hex       | Usage                      |
| --------------------------- | --------- | -------------------------- |
| `--color-surface-primary`   | `#ffffff` | Cards, panels, modals      |
| `--color-surface-secondary` | `#f5f0eb` | Page backgrounds           |
| `--color-surface-muted`     | `#f0ebe5` | Skeletons, disabled states |

### Foreground

| Token                          | Hex       | Usage                        |
| ------------------------------ | --------- | ---------------------------- |
| `--color-foreground-primary`   | `#1e1e1e` | Headings, body text          |
| `--color-foreground-secondary` | `#4a4a4a` | Secondary text               |
| `--color-foreground-muted`     | `#8a8a8a` | Placeholders, meta, disabled |
| `--color-foreground-inverse`   | `#ffffff` | Text on dark/brand surfaces  |

### Stroke

| Token                    | Hex       | Usage                 |
| ------------------------ | --------- | --------------------- |
| `--color-stroke-subtle`  | `#e5e0da` | Card borders          |
| `--color-stroke-default` | `#d4cfc8` | Inputs, dividers      |
| `--color-stroke-strong`  | `#b8b3ad` | Focus, strong borders |

### Status

| Token                         | Hex                     | Usage               |
| ----------------------------- | ----------------------- | ------------------- |
| `--color-status-success`      | `#22c55e`               | Success             |
| `--color-status-success-soft` | `rgba(34,197,94,0.12)`  | Success backgrounds |
| `--color-status-warning`      | `#f59e0b`               | Warning             |
| `--color-status-warning-soft` | `rgba(245,158,11,0.12)` | Warning backgrounds |
| `--color-status-danger`       | `#ef4444`               | Danger / error      |
| `--color-status-danger-soft`  | `rgba(239,68,68,0.12)`  | Danger backgrounds  |
| `--color-status-info`         | `#3b82f6`               | Information         |
| `--color-status-info-soft`    | `rgba(59,130,246,0.12)` | Info backgrounds    |

### Color Rules for AI Generation

- Backgrounds are warm off-white (`#f5f0eb`) or white (`#ffffff`).
- Primary actions use copper (`#b87333`) with white text.
- Use soft status backgrounds for badges, alerts, and toasts.
- Maintain WCAG AA contrast: 4.5:1 for normal text, 3:1 for large text.
- Do not use color alone to convey meaning; pair with icons or text.

---

## 3. Typography

### Type Scale

| Style      | Size | Line Height | Font                            | Usage                                  |
| ---------- | ---- | ----------- | ------------------------------- | -------------------------------------- |
| Display XL | 48px | 1.1         | Geist / Rajdhani / Oswald       | Hero headlines                         |
| Display L  | 40px | 1.15        | Display font                    | Large page titles (`--text-display-l`) |
| Display M  | 32px | 1.2         | Display font                    | Section headlines (`--text-display-m`) |
| Heading XL | 28px | 1.2         | Display font                    | Page titles                            |
| Heading L  | 24px | 1.25        | Display font                    | Section titles                         |
| Heading M  | 20px | 1.3         | Display font                    | Subsection titles                      |
| Heading S  | 18px | 1.35        | Display font                    | Card titles                            |
| Body L     | 18px | 1.6         | Inter / Inter Tight             | Lead paragraphs                        |
| Body M     | 16px | 1.6         | Inter / Inter Tight             | Body text                              |
| Body S     | 14px | 1.5         | Inter / Inter Tight             | Captions, descriptions                 |
| Caption    | 14px | 1.4         | Inter / medium                  | Labels, metadata                       |
| Label      | 12px | 1.4         | Inter / bold uppercase tracking | Badges, micro labels                   |
| Mono       | 14px | 1.5         | JetBrains Mono                  | VINs, part numbers, prices             |

### Typography Rules

- Use `font-display` for headings and CTA labels.
- Use `font-sans` (Inter) for body and captions.
- Use `font-mono` for part numbers, VINs, and tabular prices.
- One H1 per page; logical H2/H3 hierarchy.
- Marketplace uses larger display sizes; workspace starts from Heading M.

### Icons

- **Lucide only.** All icons come from `lucide-react`.
- No custom icon fonts or SVG sprites.

---

## 4. Spacing, Radius, Shadows

### Spacing Scale

| Token         | Value |
| ------------- | ----- |
| `--spacing-1` | 4px   |
| `--spacing-2` | 8px   |
| `--spacing-3` | 12px  |
| `--spacing-4` | 16px  |
| `--spacing-5` | 24px  |
| `--spacing-6` | 32px  |
| `--spacing-7` | 48px  |
| `--spacing-8` | 64px  |
| `--spacing-9` | 96px  |

### Radius Scale

| Token           | Value |
| --------------- | ----- |
| `--radius-xs`   | 4px   |
| `--radius-sm`   | 8px   |
| `--radius-md`   | 12px  |
| `--radius-lg`   | 16px  |
| `--radius-xl`   | 24px  |
| `--radius-full` | 999px |

### Shadows

| Token                 | Value                         | Usage                     |
| --------------------- | ----------------------------- | ------------------------- |
| `--shadow-card`       | `0 1px 3px rgba(0,0,0,0.08)`  | Cards, tiles              |
| `--shadow-card-hover` | `0 4px 12px rgba(0,0,0,0.12)` | Card hover                |
| `--shadow-floating`   | `0 8px 24px rgba(0,0,0,0.14)` | Popovers, drawers, toasts |

---

## 5. Layout System

### Marketplace Layout

- Centered, editorial, wide margins.
- Max container: 1440px.
- Max content: 1280px, centered.
- 12-column grid with 24px gutters.
- Single column on mobile, 2-column tablet, 3–4-column desktop.

Structure:

```
Header
Hero
Content
Footer
```

Public information pages use a compact editorial structure instead of a hero:

```
Header
Breadcrumb
InformationPageHeader
Main Content
Optional EditorialCTA
Footer
```

### Workspace Layout

- Productivity-oriented, persistent chrome.
- Sidebar + top navigation + content + optional inspector.

Structure:

```
Sidebar │ Top Navigation
        │ Page Header
        │ Toolbar
        │ Content
        │ Optional Inspector
```

### Density Modes

| Mode        | Use Case                  |
| ----------- | ------------------------- |
| Comfortable | Marketplace, empty states |
| Compact     | Dashboard default         |
| Dense       | Large tables, data grids  |

---

## 6. Component Library

### Primitives

`Button`, `Badge`, `Card` / `CardSecondary` / `CardFloating`, `Chip` / `FilterChip`, `Input`, `Skeleton`, `Tabs`, `Accordion`, `Breadcrumb`, `Pagination`, `SearchInput`, `FilterGroup`, `Modal`, `Drawer`, `Toast`, `Tooltip`.

### Composites

`Price`, `Rating`, `InventoryCount`, `SellerSummary`, `ImageGallery`, `SpecificationTable`, `VehicleLineage`, `PartCard`, `SellerCard`.

### Information Page System

`InformationPageHeader`, `InformationLayout`, `StickySidebar`, `TableOfContents`, `EditorialSection`, `InfoCallout`, `SupportCard`, `RelatedLinksCard`, `ContactMethodCard`, `NetworkStatisticCard`, `TrustFeatureCard`, `VerificationProcessTimeline`, `EditorialCTA`, `ContactForm`.

### Workspace Components

`WorkspaceLayout`, `Sidebar`, `TopNavigation`, `PageHeader`, `Toolbar`, `InspectorPanel`, `DensityProvider`.

### Page Sections

`ListingSummary`, `VehicleCompatibility`, `MediaManager`, `PricingEditor`, `ShippingEditor`, `SEOEditor`.

---

## 7. Motion & Elevation

### Durations

| Name   | Value | Use Case              |
| ------ | ----- | --------------------- |
| Fast   | 150ms | Hover, focus, toggles |
| Normal | 200ms | Open/close, expand    |
| Slow   | 300ms | Page transitions      |

### Easing

- `--ease-default`: `cubic-bezier(0.4, 0, 0.2, 1)`

### Motion Rules

- Prefer `opacity` and `transform` animations.
- Respect `prefers-reduced-motion`.
- Use the same duration for the same interaction type.

---

## 8. Responsive Breakpoints

Use Tailwind defaults:

| Breakpoint | Width  |
| ---------- | ------ |
| `sm`       | 640px  |
| `md`       | 768px  |
| `lg`       | 1024px |
| `xl`       | 1280px |
| `2xl`      | 1536px |

### Behavior

- Marketplace: single column mobile → 2-column tablet → 3–4-column desktop.
- Workspace: desktop = full sidebar + inspector; tablet = collapsed sidebar + inspector drawer; mobile = bottom navigation, no persistent sidebar/inspector.
- Touch targets ≥ 44×44px.

---

## 9. Accessibility Requirements

- One `h1` per page.
- Logical `h2`/`h3` order.
- All interactive elements keyboard reachable.
- Visible focus indicators.
- ARIA labels and roles where needed.
- Form inputs have associated labels.
- Images have alt text.
- Support `prefers-reduced-motion`.
- Color is not the sole means of conveying information.

---

## 10. Content & Voice

- **Voice:** Direct, helpful, industrial. No fluff.
- **Buttons/links:** Sentence case ("Add to cart", "Save draft").
- **Page titles/section headers:** Title case.
- **Error messages:** State what happened, why it matters, and how to fix it.
- **Empty states:** Explain why empty and what to do next.
- Use "Publish" only when a listing is complete.

---

## 11. How to Use This Spec with AI Tools

When asking an AI to generate a design or component, include:

1. **Context:** "Design a PartsPeddle UI using the PPDS spec below."
2. **Surface:** Marketplace (comfortable, editorial) or Workspace (compact, productivity).
3. **Tokens:** Reference colors, typography, spacing, radius, and shadows from this doc.
4. **Components:** Use the named primitives/composites where applicable.
5. **Constraints:** Mention accessibility, responsive breakpoints, and Lucide icons.

### Example Prompt

> Design a seller dashboard "Listings" page for PartsPeddle using PPDS.
>
> - Surface: Workspace (compact density)
> - Layout: WorkspaceLayout with Sidebar, TopNavigation, PageHeader, Toolbar, content area
> - Colors: warm neutrals (#f5f0eb background, white cards, #b87333 primary)
> - Typography: Inter body, Geist headings
> - Components: PageHeader with title "Listings" and primary button "Add Listing"; Toolbar with Filter, Sort, Search, Bulk Actions; data table with PartCard-style rows showing part image, title, price, inventory count, status badge
> - Responsive: full sidebar on desktop, collapsed on tablet, bottom nav on mobile
> - Accessibility: keyboard navigable, one H1, visible focus states

---

## 12. Source of Truth

This spec is derived from:

- `docs/design-system/01-design-tokens.md`
- `docs/design-system/02-layout-system.md`
- `docs/design-system/03-typography.md`
- `docs/design-system/04-color-system.md`
- `docs/design-system/05-elevation-motion.md`
- `docs/design-system/06-component-library.md`
- `docs/design-system/08-marketplace-spec.md`
- `docs/design-system/11-responsive-system.md`
- `docs/design-system/12-accessibility.md`
- `docs/design-system/14-content-guidelines.md`

Update this spec when any source file changes.
