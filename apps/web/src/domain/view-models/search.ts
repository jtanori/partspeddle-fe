/**
 * @deprecated Search view model types are now owned by the SCGS canonical
 * backend module. Import from `@/backend/modules/scgs` instead. This shim
 * will be removed in a future cleanup pass.
 */
export type {
  SearchResultCardModel,
  FacetValueModel,
  FacetViewModel,
  SearchPaginationModel,
  SearchMetaModel,
  SearchViewModel,
} from '@/backend/modules/scgs';

export interface SearchParityReport {
  query: string;
  resultCountMatch: boolean;
  top10Overlap: number;
  top20Overlap: number;
  facetParity: number;
  missingIds: string[];
  extraIds: string[];
}
