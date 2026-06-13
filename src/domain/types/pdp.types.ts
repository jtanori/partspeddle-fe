import { Part } from '../../types';

export interface PricingViewModel {
  partPrice: number;
  coreCharge: number;
  isCoreRefundable: boolean;
  shippingEstimate: string;
  totalEstimated: number;
}

export interface InventoryViewModel {
  quantity: number;
  status: 'available' | 'reserved' | 'sold' | 'pending';
  isInStock: boolean;
}

export interface SellerViewModel {
  id: string;
  displayName: string;
  rating: number;
  location: string;
  responseTime: string; // e.g. "24h"
}

export interface FitmentViewModel {
  confidence: 'verified' | 'high' | 'medium' | 'low';
  fitmentScore: number;
  vehicles: Array<{ year: number; make: string; model: string; engine: string }>;
}

export interface BadgeViewModel {
  isOEM: boolean;
  isTested: boolean;
  warrantyIncluded: boolean;
}

export interface PartViewModel {
  id: string;
  title: string;
  subtitle: string;
  images: string[];
  pricing: PricingViewModel;
  inventory: InventoryViewModel;
  seller: SellerViewModel;
  fitment: FitmentViewModel;
  badges: BadgeViewModel;
  description: string;
}
