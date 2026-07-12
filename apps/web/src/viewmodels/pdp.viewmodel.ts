// PDP ViewModel shim (P3.1)
//
// The canonical PDP view-model contract now lives in the SCGS backend module
// (`apps/web/src/backend/modules/scgs/contract/pdp-view-model.contract.ts`).
// This file is kept as a legacy compatibility barrel so existing imports from
// `@/viewmodels/pdp.viewmodel` and `@/domain/types/pdp.types` continue to work.
// New code should import directly from `@/backend/modules/scgs`.

import type {
  PDPSpecificationItemModel,
  PDPSpecificationGroupModel,
  PDPHeaderModel,
  PDPPricingModel,
  PDPInventoryModel,
  PDPSellerModel,
  PDPFitmentVehicleModel,
  PDPFitmentModel,
  PDPBadgeModel,
  PDPShippingModel,
  PDPPartSummaryModel,
  PDPDataModel,
  TabViewModel,
  PDPViewModel,
} from '@/backend/modules/scgs';

export {
  pdpSpecificationItemSchema,
  pdpSpecificationGroupSchema,
  pdpHeaderSchema,
  pdpPricingSchema,
  pdpInventorySchema,
  pdpSellerSchema,
  pdpFitmentVehicleSchema,
  pdpFitmentSchema,
  pdpBadgeSchema,
  pdpShippingSchema,
  pdpPartSummarySchema,
  pdpDataSchema,
} from '@/backend/modules/scgs';

export type {
  PDPSpecificationItemModel,
  PDPSpecificationGroupModel,
  PDPHeaderModel,
  PDPPricingModel,
  PDPInventoryModel,
  PDPSellerModel,
  PDPFitmentVehicleModel,
  PDPFitmentModel,
  PDPBadgeModel,
  PDPShippingModel,
  PDPPartSummaryModel,
  PDPDataModel,
  TabViewModel,
  PDPViewModel,
};

// Legacy aliases used by existing components and projections.
export type SpecificationItemViewModel = PDPSpecificationItemModel;
export type SpecificationGroupViewModel = PDPSpecificationGroupModel;
export type HeaderViewModel = PDPHeaderModel;
export type BadgeViewModel = PDPBadgeModel;
export type PricingViewModel = PDPPricingModel;
export type InventoryViewModel = PDPInventoryModel;
export type SellerViewModel = PDPSellerModel;
export type FitmentVehicleViewModel = PDPFitmentVehicleModel;
export type FitmentViewModel = PDPFitmentModel;
export type ShippingViewModel = PDPShippingModel;
export type PartSummaryViewModel = PDPPartSummaryModel;
export type PartViewModel = PDPViewModel;

// Legacy type retained for compatibility; not part of the canonical SCGS contract.
export interface DonorVehicleViewModel {
  id: string;
  title: string;
  mileage: number;
  specifications: SpecificationGroupViewModel[];
  // ... other presentational fields
}
