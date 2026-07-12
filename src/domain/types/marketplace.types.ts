// Marketplace Listing Domain Types (P2)

export type ListingType = 'PART' | 'DONOR_VEHICLE';
export type ListingStatus = 'draft' | 'pending_review' | 'available' | 'reserved' | 'sold' | 'removed' | 'archived';

export interface InventoryState {
  condition: string;
  quantity?: number;
  availabilityStatus: string;
}

export interface PricingState {
  askingPrice: number;
  currency: string;
}

export type SpecificationValue = string | number | boolean | Record<string, unknown>;

export interface ListingSpecification {
  key: string;
  label: string;
  value: SpecificationValue;
  unit?: string;
  group?: string;
  displayOrder?: number;
}

export interface MarketplaceListing {
  id: string;
  listingType: ListingType;
  sellerId: string;
  categoryId: string;
  
  title: string;
  description: string;
  createdAt: string;

  inventory: InventoryState;
  pricing: PricingState;
  specifications: ListingSpecification[];

  // Ranking factors
  listingQualityScore: number;
  sellerTrustScore: number;
}

export interface PartListing extends MarketplaceListing {
  listingType: 'PART';
  partNumber: string;
  oemPartNumber?: string;
  donorVehicleId?: string;
}

export interface DonorVehicleListing extends MarketplaceListing {
  listingType: 'DONOR_VEHICLE';
  vin: string;
  year: number;
  make: string;
  model: string;
  trim?: string;
  engineCode?: string;
  transmissionCode?: string;
  mileage: number;
  titleStatus?: string;
  dismantleStatus: 'INTACT' | 'DISMANTLING' | 'SCRAPPED';
}
