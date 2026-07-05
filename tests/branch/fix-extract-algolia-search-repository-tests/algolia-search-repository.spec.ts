import { describe, it, expect } from 'vitest';
import { AlgoliaSearchRepository } from '../../../src/backend/modules/search/infrastructure/algolia-search-repository';
import { SearchFilters } from '../../../src/backend/modules/search/domain/search-filters';

describe('AlgoliaSearchRepository', () => {
  const repo = new AlgoliaSearchRepository();

  describe('buildAlgoliaFilters', () => {
    it('handles empty filters', () => {
      const filters: SearchFilters = {};
      expect(repo.buildAlgoliaFilters(filters)).toBe('');
    });

    it('handles single facet', () => {
      const filters: SearchFilters = { makeIds: ['Honda'] };
      expect(repo.buildAlgoliaFilters(filters)).toBe("(make:'Honda')");
    });

    it('handles multiple facets', () => {
      const filters: SearchFilters = { makeIds: ['Honda', 'Toyota'], categoryIds: ['Motor'] };
      const result = repo.buildAlgoliaFilters(filters);
      expect(result).toBe("(make:'Honda' OR make:'Toyota') AND (category:'Motor')");
    });

    it('handles part type and verified filters', () => {
      const filters: SearchFilters = { partTypeIds: ['Alternator'], verifiedOnly: true };
      expect(repo.buildAlgoliaFilters(filters)).toBe("(part_type:'Alternator') AND seller_verified:true");
    });

    it('handles year range', () => {
      const filters: SearchFilters = { yearMin: 2010, yearMax: 2020 };
      expect(repo.buildAlgoliaFilters(filters)).toBe('year >= 2010 AND year <= 2020');
    });

    it('handles condition filter', () => {
      const filters: SearchFilters = { condition: ['new', 'used_good'] };
      expect(repo.buildAlgoliaFilters(filters)).toBe("(condition:'new' OR condition:'used_good')");
    });

    it('handles price range', () => {
      const filters: SearchFilters = { priceMin: 50, priceMax: 150 };
      expect(repo.buildAlgoliaFilters(filters)).toBe('price >= 50 AND price <= 150');
    });

    it('handles fitment signatures', () => {
      const filters: SearchFilters = { fitmentSignatures: ['make-1:model-1:2015', 'make-2:model-2:2020'] };
      const result = repo.buildAlgoliaFilters(filters);
      expect(result).toBe("(fitment_signatures:'make-1:model-1:2015' OR fitment_signatures:'make-2:model-2:2020')");
    });

    it('escapes single quotes in facet values', () => {
      const filters: SearchFilters = { makeIds: ["O'Reilly"] };
      expect(repo.buildAlgoliaFilters(filters)).toBe("(make:'O''Reilly')");
    });

    it('handles extremely long facet values', () => {
      const longValue = 'a'.repeat(1000);
      const filters: SearchFilters = { makeIds: [longValue] };
      const result = repo.buildAlgoliaFilters(filters);
      expect(result).toBe(`(make:'${longValue}')`);
    });

    it('handles numeric-only strings as facet values', () => {
      const filters: SearchFilters = { makeIds: ['2025'] };
      const result = repo.buildAlgoliaFilters(filters);
      expect(result).toBe("(make:'2025')");
    });

    it('handles empty arrays in filters gracefully', () => {
      const filters: SearchFilters = { makeIds: [], categoryIds: [] };
      expect(repo.buildAlgoliaFilters(filters)).toBe('');
    });

    it('ignores non-array filter values', () => {
      const filters = { makeIds: 'Honda' } as unknown as SearchFilters;
      expect(repo.buildAlgoliaFilters(filters)).toBe('');
    });
  });
});
