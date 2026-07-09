import { NextRequest, NextResponse } from 'next/server';

/**
 * In-memory token-bucket rate limiter. Suitable for MVP/single-instance
 * deployments. For distributed or production-scale deployments, replace with
 * Redis/Upstash backed storage.
 */
interface Bucket {
  tokens: number;
  lastRefill: number;
}

export interface RateLimitOptions {
  /** Maximum number of requests allowed in the window. */
  limit: number;
  /** Window size in seconds. */
  windowSeconds: number;
}

export interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetAt: Date;
}

class TokenBucketRateLimiter {
  private buckets = new Map<string, Bucket>();

  constructor(private options: RateLimitOptions) {}

  check(key: string): RateLimitResult {
    const now = Date.now();
    const windowMs = this.options.windowSeconds * 1000;
    const resetAt = new Date(Math.ceil(now / windowMs) * windowMs);

    let bucket = this.buckets.get(key);
    if (!bucket) {
      bucket = { tokens: this.options.limit, lastRefill: now };
      this.buckets.set(key, bucket);
    }

    // Refill tokens based on elapsed time, capped at limit.
    const elapsedMs = now - bucket.lastRefill;
    const tokensToAdd = (elapsedMs / windowMs) * this.options.limit;
    bucket.tokens = Math.min(this.options.limit, bucket.tokens + tokensToAdd);
    bucket.lastRefill = now;

    const allowed = bucket.tokens >= 1;
    if (allowed) {
      bucket.tokens -= 1;
    }

    return {
      allowed,
      limit: this.options.limit,
      remaining: Math.max(0, Math.floor(bucket.tokens)),
      resetAt,
    };
  }
}

const limiters = new Map<string, TokenBucketRateLimiter>();

function getLimiter(name: string, options: RateLimitOptions): TokenBucketRateLimiter {
  const key = `${name}:${options.limit}:${options.windowSeconds}`;
  if (!limiters.has(key)) {
    limiters.set(key, new TokenBucketRateLimiter(options));
  }
  return limiters.get(key)!;
}

function getClientIdentifier(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for');
  const ip = forwarded?.split(',')[0]?.trim() || req.ip || 'anonymous';
  return ip;
}

/**
 * Apply rate limiting to a request. Returns a 429 response if the limit is
 * exceeded, otherwise returns null so the caller can continue handling.
 */
export function rateLimit(
  req: NextRequest,
  options: RateLimitOptions & { keyPrefix?: string; userId?: string },
): NextResponse | null {
  const limiter = getLimiter(options.keyPrefix || 'default', {
    limit: options.limit,
    windowSeconds: options.windowSeconds,
  });

  const identifier = options.userId || getClientIdentifier(req);
  const key = `${options.keyPrefix || 'default'}:${identifier}`;
  const result = limiter.check(key);

  if (!result.allowed) {
    const retryAfter = Math.ceil((result.resetAt.getTime() - Date.now()) / 1000);
    return new NextResponse(JSON.stringify({ error: 'Rate limit exceeded.' }), {
      status: 429,
      headers: {
        'Retry-After': String(retryAfter),
        'X-RateLimit-Limit': String(result.limit),
        'X-RateLimit-Remaining': '0',
        'X-RateLimit-Reset': String(Math.ceil(result.resetAt.getTime() / 1000)),
      },
    });
  }

  return null;
}
