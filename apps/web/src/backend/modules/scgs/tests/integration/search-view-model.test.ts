import { describe, it, expect } from 'vitest';
import { buildSearchViewModel } from '../../application/build-search-view-model';
import { RankedArtifact } from '../../infrastructure/ranking-types';
import { SearchFilters } from '@/types';

function makeRankedArtifact(
  listingId: string,
  listingQuality: number,
): RankedArtifact {
  return {
    artifact: {
      listingId,
      categoryId: 'cat-1',
      version: '1.0.0',
      lineageId: `${listingId}:1.0.0:abc` as RankedArtifact['artifact']['lineageId'],
      checksum: 'abc',
      compiled: {
        flat: [],
        grouped: [],
        facets: { make: 'Honda' },
        rankingFactors: { listingQuality, sellerTrust: 0.5, recency: 0.5 },
      },
      metadata: { createdAt: new Date().toISOString(), compilerVersion: '1.0.0' },
    },
    result: {
      listingId,
      score: listingQuality,
      explanation: {
        finalScore: listingQuality,
        contributions: [],
      },
    },
  };
}

const baseFilters: SearchFilters = {
  query: 'brake',
  system: '',
  category: '',
  partTypes: [],
  priceRange: [0, 10000],
  conditions: [],
  sellerType: 'all',
  fitmentMake: 'All Makes',
  fitmentModel: 'All Models',
  fitmentYear: 'All Years',
  fitmentEngine: 'All Engines',
};

describe('SCGS buildSearchViewModel', () => {
  it('returns a validated SearchViewModel', () => {
    const ranked = [
      makeRankedArtifact('a', 0.9),
      makeRankedArtifact('b', 0.5),
    ];

    const viewModel = buildSearchViewModel({
      rankedArtifacts: ranked,
      presentations: {
        a: { title: 'Part A', price: 100 },
        b: { title: 'Part B', price: 200 },
      },
      facets: {},
      filters: baseFilters,
      page: 0,
      pageSize: 20,
      total: 2,
    });

    expect(viewModel.meta.source).toBe('SCGS');
    expect(viewModel.results).toHaveLength(2);
    expect(viewModel.results[0].id).toBe('a');
    expect(viewModel.results[0].title).toBe('Part A');
    expect(viewModel.pagination.totalPages).toBe(1);
    expect(viewModel.pagination.hasNext).toBe(false);
  });

  it('preserves the ranking order from RankedArtifact[]', () => {
    const ranked = [
      makeRankedArtifact('low', 0.3),
      makeRankedArtifact('high', 0.9),
    ];

    const viewModel = buildSearchViewModel({
      rankedArtifacts: ranked,
      presentations: {
        low: { title: 'Low', price: 100 },
        high: { title: 'High', price: 200 },
      },
      facets: {},
      filters: baseFilters,
      page: 0,
      pageSize: 20,
      total: 2,
    });

    expect(viewModel.results[0].id).toBe('low');
    expect(viewModel.results[1].id).toBe('high');
  });

  it('maps facets with selected state', () => {
    const ranked = [makeRankedArtifact('a', 0.9)];
    const filters: SearchFilters = { ...baseFilters, category: 'Brakes' };

    const viewModel = buildSearchViewModel({
      rankedArtifacts: ranked,
      presentations: { a: { title: 'Part A', price: 100 } },
      facets: {
        category: { Brakes: 5, Engine: 3 },
      },
      filters,
      page: 0,
      pageSize: 20,
      total: 1,
    });

    const categoryFacet = viewModel.facets.find(f => f.key === 'category');
    expect(categoryFacet).toBeDefined();
    expect(categoryFacet!.values).toContainEqual({
      value: 'Brakes',
      count: 5,
      selected: true,
    });
    expect(categoryFacet!.values).toContainEqual({
      value: 'Engine',
      count: 3,
      selected: false,
    });
  });

  it('computes hasNext and hasPrevious correctly', () => {
    const ranked = [makeRankedArtifact('a', 0.9)];

    const firstPage = buildSearchViewModel({
      rankedArtifacts: ranked,
      presentations: { a: { title: 'Part A', price: 100 } },
      facets: {},
      filters: baseFilters,
      page: 0,
      pageSize: 1,
      total: 3,
    });

    expect(firstPage.pagination.hasNext).toBe(true);
    expect(firstPage.pagination.hasPrevious).toBe(false);

    const lastPage = buildSearchViewModel({
      rankedArtifacts: ranked,
      presentations: { a: { title: 'Part A', price: 100 } },
      facets: {},
      filters: baseFilters,
      page: 2,
      pageSize: 1,
      total: 3,
    });

    expect(lastPage.pagination.hasNext).toBe(false);
    expect(lastPage.pagination.hasPrevious).toBe(true);
  });
});
