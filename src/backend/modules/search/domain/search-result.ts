import { SearchDocument } from './search-document';

export interface SearchDebugInfo {
  matchedOn: string[];
  rankingFactors: string[];
}

export interface SearchResult {
  hits: SearchDocument[];
  totalHits: number;
  page: number;
  totalPages: number;
  facets?: Record<string, Record<string, number>>;
  debug?: SearchDebugInfo;
}
