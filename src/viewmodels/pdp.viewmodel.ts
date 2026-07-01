// PDP ViewModel Contract (P3.1)

import type { ReactNode } from 'react';

export interface SpecificationItemViewModel {
  key: string;
  label: string;
  value: string | number | boolean;
  unit?: string;
  displayOrder: number;
}

export interface SpecificationGroupViewModel {
  name: string;
  displayOrder: number;
  specifications: SpecificationItemViewModel[];
}

export interface HeaderViewModel {
  title: string;
  subtitle: string;
  rating: number;
  ratingCount: number;
  sku: string;
}

export interface BadgeViewModel {
  isOEM: boolean;
  isTested: boolean;
  warrantyIncluded: boolean;
  isGoodFit: boolean;
}

export interface PricingViewModel {
  partPrice: number;
  coreCharge: number;
  isCoreRefundable: boolean;
  shippingEstimate: string;
  totalEstimated: number;
}

export interface InventoryViewModel {
  quantity: number;
  status: string;
  isInStock: boolean;
}

export interface SellerViewModel {
  id: string;
  displayName: string;
  rating: number;
  location: string;
  responseTime: string;
}

export interface FitmentVehicleViewModel {
  year: number;
  make: string;
  model: string;
  engine?: string;
}

export interface FitmentViewModel {
  confidence: string;
  fitmentScore: number;
  vehicles: FitmentVehicleViewModel[];
}

export interface ShippingViewModel {
  isFree: boolean;
  eta: string;
}

export interface PartSummaryViewModel {
  id: string;
  title: string;
  price: number;
  imageUrl: string;
}

export interface TabViewModel {
  id: string;
  label: string;
  content: ReactNode;
}

export interface PartViewModel {
  id: string;
  title: string;
  subtitle: string;
  price: number;
  condition: string;
  specifications: SpecificationGroupViewModel[];
  header: HeaderViewModel;
  images: string[];
  pricing: PricingViewModel;
  inventory: InventoryViewModel;
  seller: SellerViewModel;
  fitment: FitmentViewModel;
  badges: BadgeViewModel;
  shipping: ShippingViewModel;
  description: string;
  crossSell: PartSummaryViewModel[];
  tabs: TabViewModel[];
}

export interface DonorVehicleViewModel {
  id: string;
  title: string;
  mileage: number;
  specifications: SpecificationGroupViewModel[];
  // ... other presentational fields
}
