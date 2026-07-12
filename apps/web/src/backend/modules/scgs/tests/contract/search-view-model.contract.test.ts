import { describe, it, expect } from 'vitest';
import { searchViewModelSchema } from '../../contract/search-view-model.contract';

const validViewModel = {
  results: [
    {
      id: 'part-1',
      title: 'Brake Pad',
      price: '$1,200.00',
      badges: { isOEM: true, isTested: true, isGoodFit: true },
      facets: { category: 'Brakes' },
    },
  ],
  facets: [
    {
      key: 'category',
      label: 'Category',
      values: [{ value: 'Brakes', count: 5, selected: false }],
    },
  ],
  pagination: {
    page: 0,
    pageSize: 20,
    total: 1,
    totalPages: 1,
    hasNext: false,
    hasPrevious: false,
  },
  meta: {
    source: 'SCGS' as const,
    query: 'brake',
    queryMs: 42,
    rankingVersion: '1.0.0',
    generatedAt: new Date().toISOString(),
  },
};

describe('SCGS SearchViewModel contract', () => {
  it('accepts a valid view model', () => {
    const parsed = searchViewModelSchema.parse(validViewModel);
    expect(parsed.results).toHaveLength(1);
    expect(parsed.meta.source).toBe('SCGS');
  });

  it('rejects a view model with an invalid source', () => {
    const invalid = { ...validViewModel, meta: { ...validViewModel.meta, source: 'GOOGLE' } };
    expect(() => searchViewModelSchema.parse(invalid)).toThrow();
  });

  it('accepts ALGOLIA source for backward-compatible projections', () => {
    const algoliaView = { ...validViewModel, meta: { ...validViewModel.meta, source: 'ALGOLIA' as const } };
    const parsed = searchViewModelSchema.parse(algoliaView);
    expect(parsed.meta.source).toBe('ALGOLIA');
  });

  it('rejects missing required fields', () => {
    const invalid = { ...validViewModel, results: [] };
    // results empty is valid per schema, but missing pagination should fail
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { pagination, ...withoutPagination } = invalid;
    expect(() => searchViewModelSchema.parse(withoutPagination)).toThrow();
  });

  it('rejects negative pagination values', () => {
    const invalid = {
      ...validViewModel,
      pagination: { ...validViewModel.pagination, page: -1 },
    };
    expect(() => searchViewModelSchema.parse(invalid)).toThrow();
  });
});
