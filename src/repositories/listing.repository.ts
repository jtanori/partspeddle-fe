import { MarketplaceListing } from '@/domain/types/marketplace.types';

export interface ListingRepository {
  findById(id: string): Promise<MarketplaceListing | null>;
  // Future: findBySeller(sellerId: string): Promise<MarketplaceListing[]>;
}
