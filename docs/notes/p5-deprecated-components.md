# P5 Deprecation Tracking

This file tracks legacy tokens, components, and patterns that will be removed or
replaced during the P5.0 design-system convergence. The goal is a single cleanup
round once all pages have been migrated.

## Visual reference

Canonical part-page design: `/Users/dev/Documents/PartsPeddle/design-proposal.png`

## Legacy `pp-*` tokens

| File                                                    | Legacy token                                                                                                                                                  | Replacement                                              | Status                                  |
| ------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------- | --------------------------------------- |
| `tailwind.config.ts`                                    | `pp-primary`                                                                                                                                                  | `--color-brand-primary` / `text-brand-primary`           | Alias kept                              |
| `tailwind.config.ts`                                    | `pp-surface`                                                                                                                                                  | `--color-surface-secondary` / `bg-surface-secondary`     | Alias kept                              |
| `tailwind.config.ts`                                    | `pp-text`                                                                                                                                                     | `--color-foreground-primary` / `text-foreground-primary` | Alias kept                              |
| `tailwind.config.ts`                                    | `pp-card`                                                                                                                                                     | `--radius-md` / `rounded-md`                             | Alias kept                              |
| `tailwind.config.ts`                                    | `pp-gap`                                                                                                                                                      | `--spacing-6` / `gap-6`                                  | Alias kept                              |
| `tailwind.config.ts`                                    | `pp-pad`                                                                                                                                                      | `--spacing-5` / `p-5`                                    | Alias kept                              |
| `tailwind.config.ts`                                    | `pp-atom`                                                                                                                                                     | `--radius-sm` / `rounded-sm`                             | Not defined in config; update spec only |
| `src/index.css`                                         | `.pp-container`                                                                                                                                               | `Container` / `Content` primitives                       | Pending                                 |
| `src/components/ui/button.tsx`                          | `pp-primary` variant                                                                                                                                          | `primary` (default) variant                              | Done in Phase 1                         |
| `src/components/ui/badge.tsx`                           | `rounded-pp-card`, hardcoded colors                                                                                                                           | `rounded-md`, token colors                               | Done in Phase 1                         |
| `src/components/pdp-modern/PDPRoot.tsx`                 | `bg-[#F5F0EB]`                                                                                                                                                | `bg-surface-secondary`                                   | Done in Phase 1                         |
| `src/components/pdp-modern/PDPRoot.tsx`                 | `max-w-[1280px] mx-auto px-6`                                                                                                                                 | `<Content>`                                              | Done in Phase 1                         |
| `src/components/pdp-modern/PDPRoot.tsx`                 | `rounded-pp-card`                                                                                                                                             | `rounded-xl`                                             | Done in Phase 1                         |
| `src/components/pdp-modern/TrustSummaryStrip.tsx`       | `rounded-pp-card` (×1), `text-pp-primary` (×4), `bg-white`, `border-zinc-200`                                                                                 | `Card`, tokens                                           | Pending                                 |
| `src/components/pdp-modern/TabSystem.tsx`               | `rounded-pp-card` (×2), `text-pp-primary` (×2), `text-pp-text` (×7), `bg-white`, `border-zinc-200`                                                            | `Card`, tokens                                           | Pending                                 |
| `src/components/pdp-modern/SellerSupportCard.tsx`       | `rounded-pp-card` (×1), `text-pp-text` (×4), `text-pp-primary` (×4), `bg-pp-text`, `bg-white`, `border-zinc-200`                                              | `Card`, tokens                                           | Pending                                 |
| `src/components/pdp-modern/DescriptionFitmentPanel.tsx` | `rounded-pp-card` (×1), `text-pp-primary` (×2), `bg-white`, `border-zinc-200`                                                                                 | `Card`, tokens                                           | Pending                                 |
| `src/components/pdp-modern/NeedHelp.tsx`                | `rounded-pp-card` (×1), `text-pp-primary` (×3), `bg-white`, `border-zinc-200`                                                                                 | `Card`, tokens                                           | Pending                                 |
| `src/components/pdp-modern/CompatibleParts.tsx`         | `rounded-pp-card` (×1), `text-pp-primary` (×2), `bg-white`, `border-zinc-200`                                                                                 | `Card`, tokens                                           | Pending                                 |
| `src/components/pdp-modern/RecentlyViewed.tsx`          | `rounded-pp-card` (×1), `text-pp-primary` (×1), `bg-white`, `border-zinc-200`                                                                                 | `Card`, tokens                                           | Pending                                 |
| `src/components/pdp-modern/PDPLayoutEngine.tsx`         | `px-pp-pad`, `py-pp-pad`, `space-y-pp-gap`, `space-y-pp-pad`, `max-w-[1280px]`                                                                                | `Content`, `Section`, `Stack`                            | Pending                                 |
| `src/components/pdp-modern/ProductGallery.tsx`          | `rounded-pp-atom` (×3), `rounded-pp-card` (×1), `text-pp-text` (×1), `text-pp-primary` (×1), `bg-pp-text`                                                     | tokens                                                   | Pending                                 |
| `src/components/pdp-modern/ProductHeader.tsx`           | `rounded-pp-atom` (×5), `text-pp-text` (×8), `text-pp-primary` (×1), hardcoded badge colors                                                                   | tokens, `Badge`                                          | Pending                                 |
| `src/components/pdp-modern/PriceBlock.tsx`              | `text-pp-text` (×3), `text-pp-success` (×2), `bg-pp-text`, `bg-pp-primary`, `bg-pp-success`, `rounded-pp-atom` (×4), `rounded-pp-card` (×1), hardcoded colors | tokens, `Button`, `Badge`                                | Pending                                 |
| `src/components/homepage/FinalCTA.tsx`                  | `.pp-container`                                                                                                                                               | `Container` / `Content`                                  | Pending                                 |
| `src/components/homepage/GridWrapper.tsx`               | `.pp-container`                                                                                                                                               | `Container` / `Content`                                  | Pending                                 |
| `docs/PDP_V2_VISUAL_SPEC.md`                            | `pp-*` references                                                                                                                                             | Update spec to new token names                           | Pending                                 |

## Components to replace/remove

| Component                                      | Reason                                 | Replacement                         | Status  |
| ---------------------------------------------- | -------------------------------------- | ----------------------------------- | ------- |
| `src/components/homepage/FeaturedParts`        | Custom card not matching design system | `Card` + `PartCard`                 | Pending |
| `src/components/search/cards/ProductGridCard`  | Custom card styling                    | `Card` + `PartCard`                 | Pending |
| `src/components/search/cards/ProductListCard`  | Custom card styling                    | `Card` + `PartCard`                 | Pending |
| `src/components/search/SearchModal`            | Command-palette will replace modal     | New `CommandPalette`                | Pending |
| `src/components/search/MobileSearchSheet`      | Will be merged into command palette    | New `CommandPalette`                | Pending |
| `src/components/search/SearchResultsDropdown`  | Custom dropdown styling                | `CommandPalette` / `SearchInput`    | Pending |
| `src/components/search/LiveSearchDropdown`     | Custom dropdown styling                | `CommandPalette` / `SearchInput`    | Pending |
| `src/components/search/SearchListItem`         | Custom list item styling               | `PartCard` list variant             | Pending |
| `src/components/search/cards/SellerGridCard`   | Custom card styling                    | `Card` + `SellerCard`               | Pending |
| `src/components/layout/AppWrapper`             | Conditional nav logic                  | Route-group layouts                 | Pending |
| `src/components/layout/PublicShell`            | One-off wrapper                        | `Container` / `Content` / `Section` | Pending |
| `src/components/common/MainLoadingIndicator`   | Spinner loading                        | `Skeleton`                          | Pending |
| `src/components/common/InlineLoadingIndicator` | Spinner loading                        | `Skeleton`                          | Pending |

## Hardcoded values to eliminate

Common arbitrary values found across marketplace pages that should be replaced
with tokens:

| Pattern           | Example                                     | Replacement                                       |
| ----------------- | ------------------------------------------- | ------------------------------------------------- |
| Background colors | `bg-[#F5F0EB]`, `bg-[#FFF3E0]`              | `bg-surface-secondary`, status soft colors        |
| Text colors       | `text-[#1E1E1E]`, `text-[#B91C1C]`          | `text-foreground-primary`, `text-status-danger`   |
| Border colors     | `border-[#FECACA]`, `border-zinc-200`       | `border-status-danger/20`, `border-stroke-subtle` |
| Border radius     | `rounded-pp-card`, `rounded-sm`             | `rounded-xl`, `rounded-md`                        |
| Font sizes        | `text-[10px]`, `text-[11px]`, `text-[13px]` | `text-meta`, `text-caption`                       |
| Max widths        | `max-w-[1280px]`, `max-w-[720px]`           | `<Content>`, `max-w-[var(--content-max)]`         |
| Shadows           | `shadow-sm` on cards                        | `shadow-card`                                     |
