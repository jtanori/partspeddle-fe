import { describe, it, expect, vi } from 'vitest';
import { validateEnv } from '@/lib/env';

describe('P5.5 environment validation', () => {
  it('throws in production when required variables are missing', () => {
    const originalEnv = { ...process.env };
    process.env.NODE_ENV = 'production';
    process.env.SUPABASE_URL = '';
    process.env.SUPABASE_ANON_KEY = '';
    process.env.SUPABASE_SERVICE_ROLE_KEY = '';
    process.env.ALGOLIA_APP_ID = '';
    process.env.ALGOLIA_ADMIN_KEY = '';
    process.env.GEMINI_API_KEY = '';
    process.env.NEXT_PUBLIC_SUPABASE_URL = '';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = '';

    expect(validateEnv).toThrow();

    process.env = originalEnv;
  });

  it('warns but does not throw in development when variables are missing', () => {
    const originalEnv = { ...process.env };
    process.env.NODE_ENV = 'development';
    process.env.SUPABASE_URL = '';
    process.env.SUPABASE_ANON_KEY = '';
    process.env.SUPABASE_SERVICE_ROLE_KEY = '';
    process.env.ALGOLIA_APP_ID = '';
    process.env.ALGOLIA_ADMIN_KEY = '';
    process.env.GEMINI_API_KEY = '';
    process.env.NEXT_PUBLIC_SUPABASE_URL = '';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = '';

    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    expect(validateEnv).not.toThrow();
    expect(warnSpy).toHaveBeenCalled();

    warnSpy.mockRestore();
    process.env = originalEnv;
  });
});
