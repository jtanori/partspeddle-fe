import { describe, it, expect, vi, beforeEach } from 'vitest';
import { securityHeaderEntries } from '@/lib/security-headers';

describe('security headers', () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
  });

  it('includes required security headers', () => {
    process.env.NODE_ENV = 'production';
    const headers = securityHeaderEntries();
    const keys = headers.map((h) => h.key);
    expect(keys).toContain('Content-Security-Policy');
    expect(keys).toContain('Strict-Transport-Security');
    expect(keys).toContain('X-Frame-Options');
    expect(keys).toContain('X-Content-Type-Options');
    expect(keys).toContain('Referrer-Policy');
    expect(keys).toContain('Permissions-Policy');
  });

  it('uses hsts with max-age >= 63072000 and preload', () => {
    process.env.NODE_ENV = 'production';
    const headers = securityHeaderEntries();
    const hsts = headers.find((h) => h.key === 'Strict-Transport-Security')?.value || '';
    expect(hsts).toContain('max-age=63072000');
    expect(hsts).toContain('includeSubDomains');
    expect(hsts).toContain('preload');
  });

  it('does not allow unsafe-inline scripts in production', () => {
    process.env.NODE_ENV = 'production';
    const headers = securityHeaderEntries();
    const csp = headers.find((h) => h.key === 'Content-Security-Policy')?.value || '';
    expect(csp).not.toContain("'unsafe-inline'");
    expect(csp).not.toContain("'unsafe-eval'");
  });
});
