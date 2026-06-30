// PDP ViewModel Contract (P3.1)

import { ListingType } from '../domain/marketplace.types';

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

export interface PartViewModel {
  id: string;
  title: string;
  subtitle: string;
  price: number;
  condition: string;
  specifications: SpecificationGroupViewModel[];
  header: { title: string; subtitle: string; rating: number; ratingCount: number; sku: string };
  images: string[];
  pricing: { partPrice: number; coreCharge: number; isCoreRefundable: boolean; shippingEstimate: string; totalEstimated: number };
  inventory: { quantity: number; status: string; isInStock: boolean };
  seller: { id: string; displayName: string; rating: number; location: string; responseTime: string };
  fitment: { confidence: string; fitmentScore: number; vehicles: any[] };
  badges: { isOEM: boolean; isTested: boolean; warrantyIncluded: boolean; isGoodFit: boolean };
  shipping: { isFree: boolean; eta: string };
  description: string;
  crossSell: any[];
  tabs: { id: string; label: string; content: string }[];
}

export interface DonorVehicleViewModel {
  id: string;
  title: string;
  mileage: number;
  specifications: SpecificationGroupViewModel[];
  // ... other presentational fields
}
