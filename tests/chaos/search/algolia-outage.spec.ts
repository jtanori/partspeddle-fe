import { describe, it, expect, vi } from 'vitest';
import { POST } from '@/app/api/search/parts/route';
import { NextRequest } from 'next/server';
import { algoliaClient } from '@/backend/modules/search/infrastructure/algolia-client';

// Mock the algolia client
vi.mock('@/backend/modules/search/infrastructure/algolia-client', async () => {
  const actual = await vi.importActual('@/backend/modules/search/infrastructure/algolia-client');
  return {
    ...actual as any,
    algoliaClient: {
      search: vi.fn(),
    },
  };
});

describe('Search Chaos Suite: Algolia Outage', () => {
  it('handles Algolia outage gracefully', async () => {
    // Simulate Algolia failure
    (algoliaClient.search as any).mockRejectedValue(new Error('Algolia is unavailable'));

    const request = new NextRequest('http://localhost/api/search/parts', {
      method: 'POST',
      body: JSON.stringify({ query: 'alternator' }),
    });

    const response = await POST(request);
    
    // Verify graceful degradation
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.hits).toEqual([]);
    expect(data.warning).toBe('Search currently unavailable');
  });
});
