import { describe, it, expect } from 'vitest';
import { POST } from '@/app/api/search/parts/route';
import { NextRequest } from 'next/server';
import goldenQueries from './golden-queries.json';

describe('Search Relevance Benchmark', () => {
  it('meets accuracy threshold (>90%) for golden query set', async () => {
    let passedCount = 0;

    for (const testCase of goldenQueries) {
      const request = new NextRequest('http://localhost/api/search/parts', {
        method: 'POST',
        body: JSON.stringify({ query: testCase.query }),
      });

      const response = await POST(request);
      const data = await response.json();
      
      const topResults = data.hits.slice(0, 5).map((h: any) => h.objectID);
      const isMatch = testCase.expectedTopIds.some(id => topResults.includes(id));
      
      if (isMatch) {
        passedCount++;
      } else {
        console.warn(`Query "${testCase.query}" failed to return expected top result.`);
      }
    }

    const accuracy = passedCount / goldenQueries.length;
    console.log(`Relevance Accuracy: ${accuracy * 100}%`);
    expect(accuracy).toBeGreaterThanOrEqual(0.9);
  });
});
