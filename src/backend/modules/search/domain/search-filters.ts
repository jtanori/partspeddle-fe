export interface SearchFilters {
  makeIds?: string[];
  modelIds?: string[];
  yearMin?: number;
  yearMax?: number;

  // Exact fitment tuple signatures (makeId:modelId:year). Used instead of post-fetch JS filtering.
  fitmentSignatures?: string[];

  categoryIds?: string[];
  partTypeIds?: string[];

  condition?: string[];

  verifiedOnly?: boolean;

  priceMin?: number;
  priceMax?: number;
  sortBy?: 'relevance' | 'price_asc' | 'price_desc' | 'newest';
}
