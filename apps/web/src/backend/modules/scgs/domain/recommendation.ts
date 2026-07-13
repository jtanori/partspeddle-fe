export interface Recommendation {
  id: string;
  title: string;
  price: number;
  imageUrl: string;
  score: number;
  reasonCodes: string[];
}

export interface RecommendationInput {
  listingId: string;
  categoryId?: string;
  partType?: string;
  make?: string;
  model?: string;
  compatibilityVehicleIds?: string[];
  sellerId?: string;
  excludeIds?: string[];
  limit?: number;
}
