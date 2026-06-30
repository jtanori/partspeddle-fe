// PDP Domain Types (P2)
import { PartListing, DonorVehicleListing } from './marketplace.types';
import { TabViewModel, PartSummaryViewModel } from './pdp.shared';

// PDP ViewModels are now derived from Listing specializations
export interface PartViewModel extends PartListing {
  // Adds PDP-specific presentation data
  crossSell: PartSummaryViewModel[];
  tabs: TabViewModel[];
}

export interface DonorVehicleViewModel extends DonorVehicleListing {
  // Adds VDP-specific presentation data
  availableParts: PartSummaryViewModel[];
}
