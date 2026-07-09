import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function read(relativePath: string): string {
  return fs.readFileSync(path.resolve(__dirname, '../../../', relativePath), 'utf-8');
}

describe('P6.6 rotate exposed staging service-role JWT', () => {
  it('rebaseline migration drops the legacy sync-algolia-webhook trigger', () => {
    const migration = read('supabase/migrations/20260704000000_rebaseline_public_schema.sql');
    expect(migration).toContain('DROP TRIGGER IF EXISTS "sync-algolia-webhook" ON "public"."parts"');
  });

  it('rebaseline migration drops the legacy notify-new-message trigger', () => {
    const migration = read('supabase/migrations/20260704000000_rebaseline_public_schema.sql');
    expect(migration).toContain('DROP TRIGGER IF EXISTS "notify-new-message" ON "public"."messages"');
  });

  it('schema dump does not recreate the legacy triggers', () => {
    const schema = read('supabase/SCHEMA.sql');
    expect(schema).toContain('DROP TRIGGER IF EXISTS "sync-algolia-webhook"');
    expect(schema).toContain('DROP TRIGGER IF EXISTS "notify-new-message"');
    expect(schema).not.toMatch(/CREATE\s+(OR\s+REPLACE\s+)?TRIGGER\s+["']?sync-algolia-webhook/i);
    expect(schema).not.toMatch(/CREATE\s+(OR\s+REPLACE\s+)?TRIGGER\s+["']?notify-new-message/i);
  });

  it('sync-algolia-webhook Edge Function no longer trusts a bearer token', () => {
    const fn = read('supabase/functions/sync-algolia-webhook/index.ts');
    expect(fn).not.toMatch(/req\.headers\.get\(['"]authorization['"]\)/i);
    expect(fn).not.toContain('Authorization: Bearer');
    expect(fn).toContain('x-webhook-signature');
    expect(fn).toContain('verifyWebhookSignature');
  });
});
