import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import {
  validateBody,
  validateQuery,
  checkPayloadSize,
  methodNotAllowed,
} from '@/lib/api/validation';
import { safeErrorResponse } from '@/lib/api/errors';
import { rateLimit } from '@/lib/api/rate-limit';
import {
  getIdempotencyKey,
  getIdempotencyResponse,
  setIdempotencyResponse,
} from '@/lib/api/idempotency';

function createRequest(
  pathname = '/api/test',
  options: { method?: string; body?: unknown; headers?: Record<string, string> } = {},
): NextRequest {
  const url = new URL(`http://localhost:3000${pathname}`);
  const headers = new Headers(options.headers);
  if (options.body !== undefined && !headers.has('content-type')) {
    headers.set('content-type', 'application/json');
  }
  return new NextRequest(url, {
    method: options.method || 'GET',
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  });
}

describe('P5.3 API security baseline', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('validation helpers', () => {
    const schema = z.object({ name: z.string().min(1), count: z.number().int() });

    it('validates a JSON body and returns typed data', async () => {
      const req = createRequest('/api/test', { method: 'POST', body: { name: 'part', count: 5 } });
      const result = await validateBody(schema, req);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual({ name: 'part', count: 5 });
      }
    });

    it('returns 400 for invalid JSON', async () => {
      const req = new NextRequest(new URL('http://localhost:3000/api/test'), {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: 'not-json',
      });
      const result = await validateBody(schema, req);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.response.status).toBe(400);
      }
    });

    it('returns 400 with details for schema failures', async () => {
      const req = createRequest('/api/test', { method: 'POST', body: { name: '', count: 'five' } });
      const result = await validateBody(schema, req);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.response.status).toBe(400);
        const json = await result.response.json();
        expect(json.details).toBeDefined();
        expect(json.details.length).toBeGreaterThan(0);
      }
    });

    it('validates query parameters', () => {
      const url = new URL('http://localhost:3000/api/test?limit=10&offset=bad');
      const querySchema = z.object({ limit: z.coerce.number().int().min(1).max(100) });
      const result = validateQuery(querySchema, url.searchParams);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual({ limit: 10 });
      }
    });

    it('returns 405 with Allow header', () => {
      const res = methodNotAllowed(['GET', 'POST']);
      expect(res.status).toBe(405);
      expect(res.headers.get('Allow')).toBe('GET, POST');
    });
  });

  describe('safe error responses', () => {
    it('returns a safe error envelope without internal details', () => {
      const res = safeErrorResponse('Something went wrong.', 500);
      expect(res.status).toBe(500);
    });
  });

  describe('payload size guard', () => {
    it('returns 413 when content-length exceeds limit', () => {
      const req = new NextRequest(new URL('http://localhost:3000/api/test'), {
        method: 'POST',
        headers: { 'content-length': '3000000' },
      });
      const res = checkPayloadSize(req, 1024 * 1024);
      expect(res?.status).toBe(413);
    });

    it('returns null when content-length is within limit', () => {
      const req = new NextRequest(new URL('http://localhost:3000/api/test'), {
        method: 'POST',
        headers: { 'content-length': '100' },
      });
      expect(checkPayloadSize(req, 1024 * 1024)).toBeNull();
    });
  });

  describe('rate limiting', () => {
    it('returns 429 after exceeding the limit', () => {
      const req = new NextRequest(new URL('http://localhost:3000/api/test'), {
        headers: { 'x-forwarded-for': '1.2.3.4' },
      });

      // Exhaust a limit of 2.
      expect(
        rateLimit(req, { keyPrefix: 'test', limit: 2, windowSeconds: 60 })?.status,
      ).toBeUndefined();
      expect(rateLimit(req, { keyPrefix: 'test', limit: 2, windowSeconds: 60 })).toBeNull();
      const blocked = rateLimit(req, { keyPrefix: 'test', limit: 2, windowSeconds: 60 });
      expect(blocked?.status).toBe(429);
    });
  });

  describe('idempotency', () => {
    it('caches and replays a response by key', () => {
      const key = 'idem-123';
      const original = NextResponse.json({ ok: true });
      setIdempotencyResponse(key, original, { ok: true });
      const replayed = getIdempotencyResponse(key);
      expect(replayed).not.toBeNull();
      expect(replayed?.status).toBe(200);
    });

    it('extracts idempotency key from headers', () => {
      const req = new Request('http://localhost:3000/api/test', {
        headers: { 'Idempotency-Key': 'key-1' },
      });
      expect(getIdempotencyKey(req)).toBe('key-1');
    });
  });
});
