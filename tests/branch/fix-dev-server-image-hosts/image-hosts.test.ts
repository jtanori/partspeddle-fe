import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { SECURITY_HEADERS } from '@/lib/security-headers';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, '../../../');

function read(relativePath: string): string {
  return fs.readFileSync(path.join(root, relativePath), 'utf-8');
}

describe('dev server image host configuration', () => {
  it('allows seeded picsum.photos URLs in next/image remotePatterns', () => {
    const nextConfig = read('next.config.ts');
    expect(nextConfig).toContain('picsum.photos');
    expect(nextConfig).toContain('remotePatterns');
  });

  it('allows picsum.photos in the CSP img-src directive', () => {
    const csp = SECURITY_HEADERS['Content-Security-Policy'];
    expect(csp).toContain('https://picsum.photos');
  });
});
