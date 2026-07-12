import { SellerProfile } from './seller-profile';

export interface SellerRepository {
  findTopSellers(limit: number): Promise<SellerProfile[]>;
}
