import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '@/app/api/search/parts/route';
import { NextRequest } from 'next/server';

const { searchMock } = vi.hoisted(() => ({ searchMock: vi.fn() }));

vi.mock('@/backend/modules/search/infrastructure/algolia-search-repository', () => ({
  AlgoliaSearchRepository: function MockAlgoliaSearchRepository() {
    return { search: searchMock };
  },
}));

describe('Search API POST /api/search/parts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  function createRequest(body: Record<string, unknown>) {
    return new NextRequest('http://localhost/api/search/parts', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  it('returns successful response for empty query', async () => {
    searchMock.mockResolvedValue({
      hits: [],
      totalHits: 0,
      page: 0,
      totalPages: 0,
      facets: {},
    });

    const response = await POST(createRequest({ query: '', page: 0, hitsPerPage: 10 }));
    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data).toHaveProperty('hits');
    expect(data).toHaveProperty('facets');
    expect(data).toHaveProperty('totalHits');
    expect(data).toHaveProperty('page');
    expect(data).toHaveProperty('totalPages');
  });

  it('filters results by condition', async () => {
    searchMock.mockResolvedValue({
      hits: [
        { objectID: '1', title: 'New Alternator', condition: 'new', price: 100 },
        { objectID: '2', title: 'New Starter', condition: 'new', price: 120 },
      ],
      totalHits: 2,
      page: 0,
      totalPages: 1,
      facets: {},
    });

    const response = await POST(createRequest({ query: 'Alternator', conditions: ['new'] }));
    expect(response.status).toBe(200);

    const data = await response.json();
    data.hits.forEach((hit: { condition: string }) => {
      expect(hit.condition).toBe('new');
    });
  });

  it('filters results by price range', async () => {
    searchMock.mockResolvedValue({
      hits: [
        { objectID: '1', title: 'Alternator', condition: 'new', price: 75 },
        { objectID: '2', title: 'Starter', condition: 'used_good', price: 125 },
      ],
      totalHits: 2,
      page: 0,
      totalPages: 1,
      facets: {},
    });

    const response = await POST(createRequest({ query: 'Alternator', priceRange: [50, 150] }));
    expect(response.status).toBe(200);

    const data = await response.json();
    data.hits.forEach((hit: { price: number }) => {
      expect(hit.price).toBeGreaterThanOrEqual(50);
      expect(hit.price).toBeLessThanOrEqual(150);
    });
  });

  it('passes sort parameter to the repository', async () => {
    searchMock.mockResolvedValue({
      hits: [],
      totalHits: 0,
      page: 0,
      totalPages: 0,
      facets: {},
    });

    const response = await POST(createRequest({ query: 'Alternator', sortBy: 'price_asc' }));
    expect(response.status).toBe(200);

    expect(searchMock).toHaveBeenCalledWith(
      'Alternator',
      expect.objectContaining({ sortBy: 'price_asc' }),
      0,
      20,
    );
  });

  it('returns 400 for queries exceeding max length', async () => {
    const longQuery = 'a'.repeat(1001);
    const response = await POST(createRequest({ query: longQuery }));
    expect(response.status).toBe(400);

    const data = await response.json();
    expect(data.error).toBe('Query too long');
  });

  it('returns 500 for infrastructure failures without leaking details', async () => {
    searchMock.mockRejectedValue(new Error('Algolia timeout'));

    const response = await POST(createRequest({ query: 'Alternator' }));
    expect(response.status).toBe(500);

    const data = await response.json();
    expect(data.error).toBe('Search temporarily unavailable');
    expect(data).not.toHaveProperty('hits');
  });
});
