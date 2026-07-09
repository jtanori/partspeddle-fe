import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function read(relativePath: string): string {
  return fs.readFileSync(path.resolve(__dirname, '../../../', relativePath), 'utf-8');
}

function readDir(dir: string): string[] {
  return fs
    .readdirSync(path.resolve(__dirname, '../../../', dir))
    .filter((f) => f.endsWith('.sql'))
    .sort();
}

describe('P6.7 apply remediation migrations to remote-first databases', () => {
  it('has a formal remote-migration checklist document', () => {
    const doc = read('docs/P6_7_REMOTE_MIGRATION_CHECKLIST.md');
    expect(doc).toContain('Remote Migration Application Checklist');
    expect(doc).toContain('supabase db push --dry-run');
    expect(doc).toContain('Rotate the exposed service-role JWT');
  });

  it('has a remote drift verification script', () => {
    const script = read('scripts/db/verify-remote-drift.ts');
    expect(script).toContain('supabase db diff --linked --schema public');
    expect(script).toContain('process.exit(1)');
    expect(script).toContain('remote-drift-report.md');
  });

  it('exposes the drift check as a package script', () => {
    const pkg = JSON.parse(read('package.json'));
    expect(pkg.scripts['db:verify:remote-drift']).toBe('tsx scripts/db/verify-remote-drift.ts');
  });

  it('lists the remediation migrations in chronological order', () => {
    const migrations = readDir('supabase/migrations');
    expect(migrations).toContain('20260704000000_rebaseline_public_schema.sql');
    expect(migrations).toContain('20260710000000_tighten_rls_policies.sql');
    expect(migrations).toContain('20260711000000_restrict_grants.sql');
    expect(migrations).toContain('20260712000000_drop_unused_extensions.sql');

    const positions = [
      migrations.indexOf('20260704000000_rebaseline_public_schema.sql'),
      migrations.indexOf('20260710000000_tighten_rls_policies.sql'),
      migrations.indexOf('20260711000000_restrict_grants.sql'),
      migrations.indexOf('20260712000000_drop_unused_extensions.sql'),
    ];
    expect(positions).toEqual(positions.slice().sort((a, b) => a - b));
  });

  it('rebaseline migration drops legacy triggers before later migrations run', () => {
    const rebaseline = read('supabase/migrations/20260704000000_rebaseline_public_schema.sql');
    expect(rebaseline).toContain('DROP TRIGGER IF EXISTS "sync-algolia-webhook" ON "public"."parts"');
    expect(rebaseline).toContain('DROP TRIGGER IF EXISTS "notify-new-message" ON "public"."messages"');
  });
});
