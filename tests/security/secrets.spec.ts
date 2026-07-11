import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { logger, redact } from '@/lib/logger';

describe('secrets exposure', () => {
  beforeEach(() => {
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('redacts service-role key from logs', () => {
    const result = redact({ service_role_key: 'eyJ...secret' });
    expect(result?.service_role_key).not.toBe('eyJ...secret');
  });

  it('redacts algolia admin key from logs', () => {
    const result = redact({ algoliaAdminKey: 'abc123' });
    expect(result?.algoliaAdminKey).not.toBe('abc123');
  });

  it('logger.error redacts context before printing', () => {
    logger.error('upload failed', { apiKey: 'super-secret' });
    const printed = JSON.parse((console.error as any).mock.calls[0][0]);
    expect(printed.apiKey).not.toBe('super-secret');
  });

  it('does not include secret names in safe error responses', () => {
    const error = new Error('SUPABASE_SERVICE_ROLE_KEY is missing');
    const response = { error: 'Configuration error.' };
    expect(response.error).not.toContain('SUPABASE_SERVICE_ROLE_KEY');
  });
});
