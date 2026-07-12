import { describe, it, expect, vi } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

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

describe('P1.3 ranking cleanup', () => {
  it('returns SearchResult without misleading debug payload', async () => {
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

    const repo = new AlgoliaSearchRepository();
    const result = await repo.search('', {}, 0, 20);

    expect(result).not.toHaveProperty('debug');
    expect(result).toHaveProperty('hits');
    expect(result).toHaveProperty('totalHits');
    expect(result).toHaveProperty('page');
    expect(result).toHaveProperty('totalPages');
  });

  it('no longer ships the SCGS pipeline module', () => {
    const pipelineFile = path.resolve(
      __dirname,
      '../../../src/domain/specification/scgs/pipeline.ts',
    );
    expect(fs.existsSync(pipelineFile)).toBe(false);
  });
});
