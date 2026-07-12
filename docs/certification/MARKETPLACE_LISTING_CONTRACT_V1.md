# Marketplace Listing Contract (V2)

**Goal**: Define the canonical domain contract for all inventory (Parts & Donor Vehicles).

---

## 1. Core Abstractions

```ts
export type ListingType = 'PART' | 'DONOR_VEHICLE';

export interface MarketplaceListing {
  id: string;
  listingType: ListingType;
  sellerId: string;
  categoryId: string;
  
  title: string;
  description: string;
  createdAt: string;

  // Decoupled Inventory State
  inventory: InventoryState;
  pricing: PricingState;
  
  // Dynamic Specifications
  specifications: ListingSpecification[];
}

export interface InventoryState {
  condition: string;
  quantity?: number;
  availabilityStatus: string;
}

export interface PricingState {
  askingPrice: number;
  currency: string;
}

export interface ListingSpecification {
  key: string;
  label: string;
  value: string | number | boolean;
  unit?: string;
  group?: string;
  displayOrder?: number;
}

// Specializations
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
```

---
**Status**: Frozen for P2 Domain Expansion integration.
