import { Part } from '../../../../types';

export interface PartsRepository {
  getPartById(id: string): Promise<Part | null>;
  getSellerByUserId(userId: string): Promise<any | null>; // Will refine once SellerViewModel is finalized
}
