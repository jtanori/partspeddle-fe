import { describe, it, expect, vi } from 'vitest';
import { NextRequest } from 'next/server';

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

import { RankingEngine } from '../../../apps/web/src/domain/specification/scgs/ranking/ranking.engine';
import { GET } from '../../../apps/web/src/app/api/search/scgs/route';

describe('SCGS Ranking Engine resurrection', () => {
  it('is deterministic for identical inputs', () => {
    const artifacts = [
      {
        listingId: '1',
        compiled: {
          flat: [],
          grouped: [],
          facets: {},
          rankingFactors: { listingQuality: 0.9, sellerTrust: 0.8, recency: 0.7 },
        },
      },
      {
        listingId: '2',
        compiled: {
          flat: [],
          grouped: [],
          facets: {},
          rankingFactors: { listingQuality: 0.5, sellerTrust: 0.5, recency: 0.5 },
        },
      },
    ];

    const r1 = RankingEngine.rank(artifacts);
    const r2 = RankingEngine.rank(artifacts);

    expect(r1).toEqual(r2);
    expect(r1[0].listingId).toBe('1');
  });

  it('GET /api/search/scgs returns a comparison payload', async () => {
    const now = Math.floor(Date.now() / 1000);
    searchMock.mockResolvedValue({
      results: [
        {
          hits: [
            {
              objectID: 'part-a',
              title: 'Brake Pad A',
              listing_quality_score: 0.9,
              seller_trust_score: 0.8,
              created_at: now,
            },
            {
              objectID: 'part-b',
              title: 'Brake Pad B',
              listing_quality_score: 0.6,
              seller_trust_score: 0.6,
              created_at: now - 86400,
            },
          ],
          nbHits: 2,
          page: 0,
          nbPages: 1,
          facets: {},
        },
      ],
    });

    const request = new NextRequest('http://localhost/api/search/scgs?q=brake&page=0&hitsPerPage=2');
    const response = await GET(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.meta.source).toBe('SCGS');
    expect(body.comparison.algoliaTop10).toEqual(['part-a', 'part-b']);
    expect(body.comparison.scgsTop10).toContain('part-a');
    expect(body.comparison.scgsTop10).toContain('part-b');
    expect(typeof body.comparison.top10Overlap).toBe('number');
    expect(body.viewModel.meta.source).toBe('SCGS');
    expect(body.scgsScores[0]).toHaveProperty('contributions');
  });

  it('handles Algolia errors with a 500 and no masked 200 empty response', async () => {
    searchMock.mockRejectedValue(new Error('Algolia timeout'));

    const request = new NextRequest('http://localhost/api/search/scgs?q=brake');
    const response = await GET(request);
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body.error).toBe('SCGS ranking comparison failed');
  });
});
