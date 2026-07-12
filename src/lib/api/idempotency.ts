import { NextResponse } from 'next/server';

/**
 * In-memory idempotency cache. Stores key → response for 24 hours.
 * Suitable for MVP/single-instance deployments. Replace with Redis/Upstash
 * for distributed production usage.
 */
interface CachedResponse {
  status: number;
  body: unknown;
  headers: Record<string, string>;
  storedAt: number;
}

const TTL_MS = 24 * 60 * 60 * 1000;
const cache = new Map<string, CachedResponse>();

function cleanupExpired() {
  const now = Date.now();
  for (const [key, entry] of cache.entries()) {
    if (now - entry.storedAt > TTL_MS) {
      cache.delete(key);
    }
  }
}

/**
 * Look up a cached idempotency response.
 */
export function getIdempotencyResponse(key: string): NextResponse | null {
  cleanupExpired();
  const entry = cache.get(key);
  if (!entry) return null;

  return new NextResponse(JSON.stringify(entry.body), {
    status: entry.status,
    headers: entry.headers,
  });
}

/**
 * Store a response in the idempotency cache.
 */
export function setIdempotencyResponse(key: string, response: NextResponse, body: unknown): void {
  cleanupExpired();
  const headers: Record<string, string> = {};
  response.headers.forEach((value, name) => {
    headers[name] = value;
  });

  cache.set(key, {
    status: response.status,
    body,
    headers,
    storedAt: Date.now(),
  });
}

/**
 * Extract the idempotency key from a request header.
 */
export function getIdempotencyKey(req: Request): string | null {
  return req.headers.get('Idempotency-Key') || req.headers.get('X-Idempotency-Key');
}
