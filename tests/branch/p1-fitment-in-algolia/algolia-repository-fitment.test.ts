import { describe, it, expect, vi, beforeEach } from 'vitest';

const { searchMock } = vi.hoisted(() => ({ searchMock: vi.fn() }));

vi.mock('@/backend/modules/search/infrastructure/algolia-client', () => ({
  algoliaClient: {
    search: searchMock,
    saveObjects: vi.fn(),
    deleteObject: vi.fn(),
    setSettings: vi.fn(),
  },
  SEARCH_INDEX_NAME: 'parts',
  INDEX_PRICE_ASC: 'parts_price_asc',
  INDEX_PRICE_DESC: 'parts_price_desc',
  INDEX_NEWEST: 'parts_newest',
}));

import { AlgoliaSearchRepository } from '../../../apps/web/src/backend/modules/search/infrastructure/algolia-search-repository';

describe('AlgoliaSearchRepository fitment search', () => {
  beforeEach(() => {
    searchMock.mockReset();
  });

  it('passes fitment signatures to algoliaClient.search', async () => {
    searchMock.mockResolvedValue({
      results: [
        {
          hits: [{ objectID: 'part-1' }],
          nbHits: 1,
          page: 0,
          nbPages: 1,
          facets: {},
        },
      ],
    });

    const repo = new AlgoliaSearchRepository();
    const result = await repo.search(
      '',
      { fitmentSignatures: ['make-1:model-1:2015'] },
      0,
      20,
    );

    expect(searchMock).toHaveBeenCalledWith(
      expect.objectContaining({
        requests: [
          expect.objectContaining({
            filters: expect.stringContaining(
              "fitment_signatures:'make-1:model-1:2015'",
            ),
          }),
        ],
      }),
    );
    expect(result.totalHits).toBe(1);
  });
});
