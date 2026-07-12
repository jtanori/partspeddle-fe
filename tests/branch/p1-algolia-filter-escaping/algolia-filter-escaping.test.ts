import { describe, it, expect, vi } from 'vitest';

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
import { SearchFilters } from '../../../apps/web/src/backend/modules/search/domain/search-filters';

describe('P1.5 Algolia filter escaping', () => {
  beforeEach(() => {
    searchMock.mockClear();
    searchMock.mockResolvedValue({
      results: [
        {
          hits: [],
          nbHits: 0,
          page: 0,
          nbPages: 0,
          facets: {},
        },
      ],
    });
  });

  it('doubles single quotes instead of using backslash escaping', async () => {
    const repo = new AlgoliaSearchRepository();
    const filters: SearchFilters = {
      categoryIds: ["O'Reilly"],
    };

    await repo.search('', filters, 0, 20);

    const call = searchMock.mock.calls[0][0];
    expect(call.requests[0].filters).toContain("category:'O''Reilly'");
  });

  it('does not break out of the quoted value with injection payloads', async () => {
    const repo = new AlgoliaSearchRepository();
    const filters: SearchFilters = {
      makeIds: ["Ford' OR '1'='1"],
    };

    await repo.search('', filters, 0, 20);

    const call = searchMock.mock.calls[0][0];
    expect(call.requests[0].filters).toContain("make:'Ford'' OR ''1''=''1'");
    expect(call.requests[0].filters).not.toContain("make:'Ford' OR '1'='1'");
  });

  it('escapes quotes in fitment signatures', async () => {
    const repo = new AlgoliaSearchRepository();
    const filters: SearchFilters = {
      fitmentSignatures: ["make'1:model'2:2020"],
    };

    await repo.search('', filters, 0, 20);

    const call = searchMock.mock.calls[0][0];
    expect(call.requests[0].filters).toContain(
      "fitment_signatures:'make''1:model''2:2020'",
    );
  });

  it('leaves numeric and boolean filters unquoted', async () => {
    const repo = new AlgoliaSearchRepository();
    const filters: SearchFilters = {
      yearMin: 2010,
      yearMax: 2020,
      priceMin: 100,
      priceMax: 5000,
      verifiedOnly: true,
    };

    await repo.search('', filters, 0, 20);

    const call = searchMock.mock.calls[0][0];
    expect(call.requests[0].filters).toContain('year >= 2010');
    expect(call.requests[0].filters).toContain('year <= 2020');
    expect(call.requests[0].filters).toContain('price >= 100');
    expect(call.requests[0].filters).toContain('price <= 5000');
    expect(call.requests[0].filters).toContain('seller_verified:true');
  });
});
