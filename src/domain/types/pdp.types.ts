// PDP type barrel (P0.6)
// Domain-level PDP types are centralized in the viewmodel contract while the
// taxonomy/SCGS work stabilizes the build. Re-export from here so existing
// component imports continue to resolve.

export type {
  BadgeViewModel,
  DonorVehicleViewModel,
  FitmentViewModel,
  HeaderViewModel,
  InventoryViewModel,
  PartSummaryViewModel,
  PartViewModel,
  PricingViewModel,
  SellerViewModel,
  ShippingViewModel,
  SpecificationGroupViewModel,
  SpecificationItemViewModel,
  TabViewModel,
} from '@/viewmodels/pdp.viewmodel';
