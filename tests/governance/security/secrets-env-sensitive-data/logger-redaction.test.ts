import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { redact, logger } from '@/lib/logger';

describe('P5.5 logger redaction', () => {
  beforeEach(() => {
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('redacts sensitive keys in context objects', () => {
    const result = redact({
      user: 'buyer-1',
      token: 'super-secret-jwt',
      apiKey: 'algolia-admin-key',
      password: 'hunter2',
    });

    expect(result?.user).toBe('buyer-1');
    expect(result?.token).not.toBe('super-secret-jwt');
    expect(result?.token).toContain('***');
    expect(result?.apiKey).not.toBe('algolia-admin-key');
    expect(result?.password).not.toBe('hunter2');
  });

  it('redacts nested sensitive values', () => {
    const result = redact({
      metadata: {
        email: 'seller@example.com',
        session: { cookie: 'session-token-value' },
      },
    });

    expect((result?.metadata as Record<string, unknown>)?.email).not.toBe('seller@example.com');
    expect(
      ((result?.metadata as Record<string, unknown>)?.session as Record<string, unknown>)?.cookie,
    ).not.toBe('session-token-value');
  });

  it('does not redact non-sensitive keys', () => {
    const result = redact({ listingId: '123', count: 5 });
    expect(result).toEqual({ listingId: '123', count: 5 });
  });

  it('logger.info redacts before printing', () => {
    logger.info('test', { secret: 'shh' });
    const printed = JSON.parse((console.log as any).mock.calls[0][0]);
    expect(printed.secret).not.toBe('shh');
    expect(printed.secret).toContain('***');
  });
});
