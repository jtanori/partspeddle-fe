# PPDS Component Library

Components are organized in layers.

## Primitives (`src/components/ui/`)

- `Button`
- `Badge`
- `Card` / `CardSecondary` / `CardFloating`
- `Chip` / `FilterChip`
- `Input` (pending — not yet added to Storybook; use `SearchInput` for the current catalog)
- `Skeleton`
- `Tabs`
- `Accordion`
- `Breadcrumb`
- `Pagination`
- `SearchInput`
- `FilterGroup`
- `Modal`
- `Drawer`
- `Toast`
- `Tooltip`

## Composites (`src/components/design-system/`)

- `Price`
- `Rating`
- `InventoryCount`
- `SellerSummary`
- `ImageGallery`
- `SpecificationTable`
- `VehicleLineage`
- `PartCard`
- `SellerCard`

## Workspace components (`src/components/workspace/`)

- `WorkspaceLayout`
- `Sidebar`
- `TopNavigation`
- `PageHeader`
- `Toolbar`
- `InspectorPanel`
- `DensityProvider`

## Information Page System (`src/components/information-pages/`)

Reusable components for public editorial pages:

- `InformationPageHeader`
- `InformationLayout`
- `StickySidebar`
- `TableOfContents`
- `EditorialSection`
- `InfoCallout`
- `SupportCard`
- `RelatedLinksCard`
- `ContactMethodCard`
- `NetworkStatisticCard`
- `TrustFeatureCard`
- `VerificationProcessTimeline`
- `EditorialCTA`
- `ContactForm`

## Sections

Reusable page sections built from composites:

- `ListingSummary`
- `VehicleCompatibility`
- `MediaManager`
- `PricingEditor`
- `ShippingEditor`
- `SEOEditor`

## Rules

- Primitives are surface-agnostic.
- Composites are domain-aware but still reusable across surfaces.
- Workspace components are internal-only.
- Sections are page-level building blocks.
- IPS components are marketplace-only and follow the public page structure: header, breadcrumb, compact page header, main content, optional editorial CTA, footer.
