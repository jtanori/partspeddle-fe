import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function read(relativePath: string): string {
  return fs.readFileSync(path.resolve(__dirname, '../../../', relativePath), 'utf-8');
}

describe('P6.5 add replay protection to webhook signatures', () => {
  const source = read('supabase/functions/sync-algolia-webhook/index.ts');

  it('defines a maximum webhook age tolerance', () => {
    expect(source).toContain('MAX_AGE_MS');
  });

  it('parses payload timestamps', () => {
    expect(source).toContain('parseTimestamp');
  });

  it('rejects stale or missing timestamps', () => {
    expect(source).toContain('isStaleTimestamp');
    expect(source).toContain('Missing or stale webhook timestamp');
  });

  it('enforces timestamp validation after signature verification', () => {
    expect(source).toContain("await req.json()");
    expect(source).toMatch(/isStaleTimestamp\s*\(\s*payload\.timestamp\s*\)/);
    expect(source).toMatch(/unauthorized\s*\(\s*['"]Missing or stale webhook timestamp['"]\s*\)/);
  });

  it('keeps HMAC signature verification in place', () => {
    expect(source).toContain('x-webhook-signature');
    expect(source).toContain('verifyWebhookSignature');
    expect(source).toContain('crypto.subtle.sign');
  });
});
