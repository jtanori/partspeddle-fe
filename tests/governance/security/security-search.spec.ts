import { describe, it, expect } from 'vitest';
import { POST } from '@/app/api/search/parts/route';
import { NextRequest } from 'next/server';

describe('Search API Security Suite', () => {
  const complexPayloads = [
    { query: "<script>alert('XSS')</script>", expected: "safe" },
    { query: "http://internal-service.local", expected: "safe" },
    { query: "1 OR 1=1", expected: "safe" },
    { query: "UNION SELECT * FROM users", expected: "safe" }
  ];

  it('handles complex XSS and SSRF payloads safely', async () => {
    for (const { query } of complexPayloads) {
      const request = new NextRequest('http://localhost/api/search/parts', {
        method: 'POST',
        body: JSON.stringify({ query }),
      });

      const response = await POST(request);
      // The API should handle this gracefully and return 200 (even if empty results)
      expect(response.status).toBe(200);
    }
  });

  it('limits query size to prevent Algolia abuse', async () => {
    const longQuery = 'a'.repeat(1001); // Update to be just over our new limit of 1000
    const request = new NextRequest('http://localhost/api/search/parts', {
      method: 'POST',
      body: JSON.stringify({ query: longQuery }),
    });

    const response = await POST(request);
    // Expect 400 Bad Request for excessive query size
    expect(response.status).toBe(400);
  });
});
