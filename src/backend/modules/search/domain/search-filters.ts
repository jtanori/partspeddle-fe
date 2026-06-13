export interface SearchFilters {
  makeIds?: string[];
  modelIds?: string[];
  yearMin?: number;
  yearMax?: number;

  categoryIds?: string[];
  partTypeIds?: string[];

  condition?: string[];

  verifiedOnly?: boolean;

  priceMin?: number;
  priceMax?: number;
  sortBy?: 'relevance' | 'price_asc' | 'price_desc' | 'newest';
}
