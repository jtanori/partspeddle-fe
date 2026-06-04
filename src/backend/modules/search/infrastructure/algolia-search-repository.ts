import { SearchRepository } from '../domain/search-repository';
import { SearchFilters } from '../domain/search-filters';
import { SearchResult } from '../domain/search-result';
import { SearchDocument } from '../domain/search-document';
import { algoliaClient, SEARCH_INDEX_NAME } from './algolia-client';

export class AlgoliaSearchRepository implements SearchRepository {
  async search(query: string, filters: SearchFilters, page: number, hitsPerPage: number): Promise<SearchResult> {
    const algoliaFilters = this.buildAlgoliaFilters(filters);

    const result = await algoliaClient.search({
      requests: [
        {
          indexName: SEARCH_INDEX_NAME,
          query,
          filters: algoliaFilters,
          page,
          hitsPerPage,
        },
      ],
    });

    const response = result.results[0] as any;

    return {
      hits: response.hits as SearchDocument[],
      totalHits: response.nbHits,
      page: response.page,
      totalPages: response.nbPages,
      facets: response.facets,
      debug: {
        matchedOn: response.processingTimingsMS, // Placeholder for actual match info
        rankingFactors: ['sellerVerified', 'sellerTrustScore', 'listingQualityScore', 'createdAt']
      }
    };
  }

  async saveDocument(document: SearchDocument): Promise<void> {
    await algoliaClient.saveObjects({
      indexName: SEARCH_INDEX_NAME,
      objects: [document],
    });
  }

  async deleteDocument(partId: string): Promise<void> {
    await algoliaClient.deleteObject({
      indexName: SEARCH_INDEX_NAME,
      objectID: partId,
    });
  }

  async saveDocuments(documents: SearchDocument[]): Promise<void> {
    await algoliaClient.saveObjects({
      indexName: SEARCH_INDEX_NAME,
      objects: documents,
    });
  }

  private buildAlgoliaFilters(filters: SearchFilters): string {
    const parts: string[] = [];

    if (filters.makeIds && filters.makeIds.length > 0) {
      parts.push(`(${filters.makeIds.map(id => `makeIds:${id}`).join(' OR ')})`);
    }

    if (filters.modelIds && filters.modelIds.length > 0) {
      parts.push(`(${filters.modelIds.map(id => `modelIds:${id}`).join(' OR ')})`);
    }

    if (filters.yearMin !== undefined) {
      parts.push(`year >= ${filters.yearMin}`);
    }

    if (filters.yearMax !== undefined) {
      parts.push(`year <= ${filters.yearMax}`);
    }

    if (filters.categoryIds && filters.categoryIds.length > 0) {
      parts.push(`(${filters.categoryIds.map(id => `categoryIds:${id}`).join(' OR ')})`);
    }

    if (filters.partTypeIds && filters.partTypeIds.length > 0) {
      parts.push(`(${filters.partTypeIds.map(id => `partTypeIds:${id}`).join(' OR ')})`);
    }

    if (filters.condition && filters.condition.length > 0) {
      parts.push(`(${filters.condition.map(c => `condition:${c}`).join(' OR ')})`);
    }

    if (filters.verifiedOnly) {
      parts.push('sellerVerified:true');
    }

    if (filters.priceMin !== undefined) {
      parts.push(`price >= ${filters.priceMin}`);
    }

    if (filters.priceMax !== undefined) {
      parts.push(`price <= ${filters.priceMax}`);
    }

    return parts.join(' AND ');
  }
}
