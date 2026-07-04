export interface FacetViewModel {
  key: string;
  label: string;
  values: Array<{
    value: string;
    count: number;
    selected: boolean;
  }>;
}

export interface SearchResultCardModel {
  id: string;
  title: string;
  price: string;
  imageUrl?: string;
  subtitle?: string;
  conditionLabel?: string;
  conditionColor?: string;
  sellerName?: string;
  sellerRating?: number;
  sellerReviewCount?: number;
  fitmentSummary?: string;
  badges: {
    isOEM: boolean;
    isTested: boolean;
    isGoodFit: boolean;
  };
  facets: Record<string, string | number | boolean>;
}

export interface SearchViewModel {
  results: SearchResultCardModel[];
  facets: FacetViewModel[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
  meta: {
    source: "ALGOLIA" | "SCGS";
    queryMs?: number;
  };
}

export interface SearchParityReport {
  query: string;
  resultCountMatch: boolean;
  top10Overlap: number;
  top20Overlap: number;
  facetParity: number;
  missingIds: string[];
  extraIds: string[];
}
