export interface FacetViewModel {
  key: string;
  label: string;
  values: Array<{
    value: string;
    count: number;
    selected: boolean;
  }>;
}

export interface SearchResultViewModel {
  id: string;
  title: string;
  price: number;
  image?: string;

  subtitle?: string;
  facets: Record<string, string | number | boolean>;
  ranking?: {
    score: number;
    reasons?: string[];
  };
}

export interface SearchViewModel {
  results: SearchResultViewModel[];

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
    driftScore?: number;
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
