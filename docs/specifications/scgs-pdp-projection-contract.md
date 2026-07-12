# SCGS PDP Projection Contract

## Purpose

Defines the canonical projection returned by SCGS for the Product Detail Page
(PDP). Any server-side render of a PDP receives a `PDPViewModel` validated
against this contract.

## Ownership

This contract is owned by the SCGS backend module:

```
apps/web/src/backend/modules/scgs/contract/pdp-view-model.contract.ts
```

The legacy file `apps/web/src/viewmodels/pdp.viewmodel.ts` is a temporary shim
and re-exports canonical SCGS types with legacy names for backward
compatibility. New code should import directly from `@/backend/modules/scgs`.

## Schema

Serializable data is validated by Zod. UI-specific fields (`tabs` with
`ReactNode` content) are enforced by TypeScript only.

```ts
interface PDPViewModel extends PDPDataModel {
  tabs: TabViewModel[];
}

interface PDPDataModel {
  id: string;
  title: string;
  subtitle: string;
  price: number;
  condition: string;
  images: string[];
  description: string;
  header: PDPHeaderModel;
  specifications: PDPSpecificationGroupModel[];
  pricing: PDPPricingModel;
  inventory: PDPInventoryModel;
  seller: PDPSellerModel;
  fitment: PDPFitmentModel;
  badges: PDPBadgeModel;
  shipping: PDPShippingModel;
  crossSell: PDPPartSummaryModel[];
}
```

## Nested models

- `PDPHeaderModel` — title, subtitle, rating, ratingCount, sku.
- `PDPSpecificationGroupModel` — grouped specifications with display order.
- `PDPPricingModel` — partPrice, coreCharge, isCoreRefundable,
  shippingEstimate, totalEstimated.
- `PDPInventoryModel` — quantity, status, isInStock.
- `PDPSellerModel` — id, displayName, rating, location, responseTime.
- `PDPFitmentModel` — confidence, fitmentScore, vehicles.
- `PDPBadgeModel` — isOEM, isTested, warrantyIncluded, isGoodFit.
- `PDPShippingModel` — isFree, eta.
- `PDPPartSummaryModel` — id, title, price, imageUrl.
- `TabViewModel` — id, label, content (ReactNode).

## Guarantees

- `PDPDataModel` is validated by `pdpDataSchema` before the view model is
  returned.
- `badges.isOEM` is derived from `condition.toUpperCase() === 'NEW'`.
- `badges.isTested` and `badges.isGoodFit` are derived from ranking factors and
  compatibility data.
- `fitment.vehicles` is built from presentation compatibility entries, with year
  ranges parsed to their first matched year.
- `header.sku` falls back to the artifact `listingId` when omitted.
- `tabs` are appended by the use case and are not part of the serializable
  schema.

## Building the view model

Use the application use case:

```ts
import { buildPDPViewModel } from '@/backend/modules/scgs';

const viewModel = buildPDPViewModel({
  artifact, // CompiledSemanticArtifact
  presentation, // PDPViewModelPresentation
});
```

`PDPViewModelPresentation` carries presentational data that is not contained in
the compiled artifact: title, subtitle, price, condition, images, description,
sku, compatibility, seller, and optional cross-sell parts.

## `/app/(public)/listing/[id]/page.tsx`

This route is the reference implementation. It:

1. Loads the listing via the canonical catalog repository.
2. Resolves seller and compatibility data.
3. Builds or loads a `CompiledSemanticArtifact`.
4. Builds a `PDPViewModel` with `buildPDPViewModel`.
5. Passes the validated view model to the PDP component tree.

## Future evolution

- Phase 4 may move tab content generation into a dedicated presentation mapper.
- Phase 5 may enrich cross-sell parts from SCGS ranking signals.
