import { describe, it, expect } from 'vitest';
import { POST } from '@/app/api/search/parts/route';
import { NextRequest } from 'next/server';

describe('Search API Sorting Certification', () => {
  const runSortTest = async (sortBy: string) => {
    const request = new NextRequest('http://localhost/api/search/parts', {
      method: 'POST',
      body: JSON.stringify({ query: 'Alternator', sortBy }),
    });
    const response = await POST(request);
    expect(response.status).toBe(200);
    return response.json();
  };

  it('verifies price_asc sorting', async () => {
    const data = await runSortTest('price_asc');
    for (let i = 0; i < data.hits.length - 1; i++) {
      expect(data.hits[i].price).toBeLessThanOrEqual(data.hits[i+1].price);
    }
  });

  it('verifies price_desc sorting', async () => {
    const data = await runSortTest('price_desc');
    for (let i = 0; i < data.hits.length - 1; i++) {
      expect(data.hits[i].price).toBeGreaterThanOrEqual(data.hits[i+1].price);
    }
  });

  it('verifies newest sorting', async () => {
    const data = await runSortTest('newest');
    for (let i = 0; i < data.hits.length - 1; i++) {
      expect(new Date(data.hits[i].createdAt).getTime()).toBeGreaterThanOrEqual(
        new Date(data.hits[i+1].createdAt).getTime()
      );
    }
  });
});
