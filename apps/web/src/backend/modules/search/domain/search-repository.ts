import { SearchFilters } from './search-filters';
import { SearchResult } from './search-result';
import { SearchDocument } from './search-document';

export interface SearchRepository {
  search(
    query: string,
    filters: SearchFilters,
    page: number,
    hitsPerPage: number,
  ): Promise<SearchResult>;
  saveDocument(document: SearchDocument): Promise<void>;
  deleteDocument(partId: string): Promise<void>;
  saveDocuments(documents: SearchDocument[]): Promise<void>;
}
