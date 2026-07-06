import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, '../../../');

function read(relativePath: string): string {
  return fs.readFileSync(path.join(root, relativePath), 'utf-8');
}

function listMigrations(): string[] {
  return fs
    .readdirSync(path.join(root, 'supabase/migrations'))
    .filter((file) => file.endsWith('.sql'))
    .sort();
}

describe('P2.10 database trigger cleanup', () => {
  const migration = read('supabase/migrations/20260704000000_rebaseline_public_schema.sql');

  it('uses the rebaseline migration as the active migration', () => {
    expect(listMigrations()).toContain('20260704000000_rebaseline_public_schema.sql');
  });

  it('archives the old trigger-hardening migration', () => {
    expect(
      fs.existsSync(
        path.join(
          root,
          'supabase/migrations/archive/20260703000000_harden_security_definer_triggers.sql',
        ),
      ),
    ).toBe(true);
  });

  it('removes synchronous Algolia HTTP trigger coupling', () => {
    expect(migration).not.toContain('tr_sync_part_to_algolia');
    expect(migration).not.toContain('fn_sync_part_to_algolia');
    expect(migration).not.toContain('net.http_post');
  });

  it('keeps async search_outbox enqueue path on parts', () => {
    expect(migration).toContain('CREATE OR REPLACE FUNCTION "public"."fn_enqueue_search_event"()');
    expect(migration).toContain('INSERT INTO public.search_outbox');
  });

  it('keeps SECURITY DEFINER trigger functions', () => {
    for (const fn of ['fn_enqueue_search_event', 'fn_audit_log_changes', 'handle_part_sale_lock']) {
      expect(migration).toContain(
        `CREATE OR REPLACE FUNCTION "public"."${fn}"() RETURNS "trigger"`,
      );
      expect(migration).toContain('SECURITY DEFINER');
    }
  });
});
