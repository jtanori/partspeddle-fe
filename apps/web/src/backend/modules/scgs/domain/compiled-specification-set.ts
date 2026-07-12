export interface ResolvedSpec {
  key: string;
  label: string;
  value: string | number | boolean;
  unit?: string;
  group: string;
  groupOrder: number;
  displayOrder: number;
  isSearchable: boolean;
  isFacetable: boolean;
}

export interface SpecGroup {
  name: string;
  order: number;
  items: ResolvedSpec[];
}

export interface CompiledSpecificationSet {
  flat: ResolvedSpec[];
  grouped: SpecGroup[];
  facets: Record<string, string | number | boolean>;
  rankingFactors: {
    listingQuality: number;
    sellerTrust: number;
    recency: number;
    /** Optional additional signals introduced in Phase 1. */
    imageQuality?: number;
    inventoryCompleteness?: number;
    popularity?: number;
    responseRate?: number;
    conversionScore?: number;
  };
}
