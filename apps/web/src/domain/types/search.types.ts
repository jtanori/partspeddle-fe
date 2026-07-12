// Search Read Models (P2)
import { ListingType } from './marketplace.types';

export interface MarketplaceSearchDocument {
  objectID: string;
  documentType: ListingType;
  title: string;
  subtitle?: string;
  price?: number;
  sellerId: string;
  categorySlug: string;
  facets: Record<string, string | number | boolean>;
  updatedAt: string;
}

export interface PartSearchDocument extends MarketplaceSearchDocument {
  documentType: 'PART';
  partNumber: string;
  condition: string;
}

export interface DonorVehicleSearchDocument extends MarketplaceSearchDocument {
  documentType: 'DONOR_VEHICLE';
  vin: string;
  mileage: number;
}
