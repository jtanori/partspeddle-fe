import { describe, it, expect, vi, beforeEach } from 'vitest';
import { securityHeaderEntries, buildContentSecurityPolicy } from '@/lib/security-headers';

describe('security headers', () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
  });

  it('includes required static security headers', () => {
    const headers = securityHeaderEntries();
    const keys = headers.map((h) => h.key);
    expect(keys).toContain('Strict-Transport-Security');
    expect(keys).toContain('X-Frame-Options');
    expect(keys).toContain('X-Content-Type-Options');
    expect(keys).toContain('Referrer-Policy');
    expect(keys).toContain('Permissions-Policy');
  });

  it('does not include Content-Security-Policy in static headers', () => {
    const headers = securityHeaderEntries();
    const keys = headers.map((h) => h.key);
    expect(keys).not.toContain('Content-Security-Policy');
  });

  it('uses hsts with max-age >= 63072000 and preload', () => {
    const headers = securityHeaderEntries();
    const hsts = headers.find((h) => h.key === 'Strict-Transport-Security')?.value || '';
    expect(hsts).toContain('max-age=63072000');
    expect(hsts).toContain('includeSubDomains');
    expect(hsts).toContain('preload');
  });

  it('builds a nonce-aware CSP without unsafe-inline', () => {
    const nonce = 'dGVzdC1ub25jZQ==';
    const csp = buildContentSecurityPolicy(nonce);
    expect(csp).toContain(`script-src 'self' 'nonce-${nonce}'`);
    expect(csp).not.toContain("'unsafe-inline'");
    expect(csp).not.toContain("'unsafe-eval'");
  });

  it('falls back to unsafe-inline when no nonce is provided', () => {
    process.env.NODE_ENV = 'production';
    const csp = buildContentSecurityPolicy();
    expect(csp).toContain("script-src 'self' 'unsafe-inline'");
    expect(csp).not.toContain("'unsafe-eval'");
  });

  it('dev fallback allows unsafe-eval for hmr', () => {
    process.env.NODE_ENV = 'development';
    const csp = buildContentSecurityPolicy();
    expect(csp).toContain("script-src 'self' 'unsafe-inline' 'unsafe-eval'");
  });
});
