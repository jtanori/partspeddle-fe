import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  SECURITY_HEADERS,
  securityHeaderEntries,
} from '@/lib/security-headers';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function read(relativePath: string): string {
  return fs.readFileSync(path.resolve(__dirname, '../../../', relativePath), 'utf-8');
}

describe('P2.9 security headers', () => {
  it('exports baseline security headers required by PRC certification', () => {
    expect(SECURITY_HEADERS['Content-Security-Policy']).toBeTruthy();
    expect(SECURITY_HEADERS['Strict-Transport-Security']).toContain('max-age=');
    expect(SECURITY_HEADERS['X-Frame-Options']).toBe('DENY');
    expect(SECURITY_HEADERS['Referrer-Policy']).toBe('strict-origin-when-cross-origin');
  });

  it('includes hardening headers alongside the baseline set', () => {
    expect(SECURITY_HEADERS['X-Content-Type-Options']).toBe('nosniff');
    expect(SECURITY_HEADERS['Permissions-Policy']).toContain('camera=()');
  });

  it('allows required third-party origins in the CSP', () => {
    const csp = SECURITY_HEADERS['Content-Security-Policy'];
    expect(csp).toContain("default-src 'self'");
    expect(csp).toContain("style-src 'self' 'unsafe-inline'");
    expect(csp).toContain('https://*.supabase.co');
    expect(csp).toContain('wss://*.supabase.co');
    expect(csp).toContain('https://*.algolia.net');
    expect(csp).toContain('https://images.unsplash.com');
    expect(csp).toContain("frame-ancestors 'none'");
  });

  it('maps headers into Next.js header entry objects', () => {
    const entries = securityHeaderEntries();
    expect(entries).toEqual(
      expect.arrayContaining([
        { key: 'Content-Security-Policy', value: SECURITY_HEADERS['Content-Security-Policy'] },
        { key: 'Strict-Transport-Security', value: SECURITY_HEADERS['Strict-Transport-Security'] },
      ]),
    );
    expect(entries).toHaveLength(Object.keys(SECURITY_HEADERS).length);
  });

  it('wires headers() in next.config.ts for all routes', () => {
    const config = read('next.config.ts');
    expect(config).toContain('async headers()');
    expect(config).toContain('source: "/:path*"');
    expect(config).toContain('securityHeaderEntries');
    expect(config).toContain('./src/lib/security-headers');
  });
});