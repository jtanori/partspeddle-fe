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
  it('has a remote drift verification script', () => {
    const script = read('platform/scripts/migration/verify-remote-drift.ts');
    expect(script).toContain('supabase db diff --linked --schema public');
    expect(script).toContain('process.exit(1)');
    expect(script).toContain('remote-drift-report.md');
  });

  it('exposes the drift check as a package script', () => {
    const pkg = JSON.parse(read('package.json'));
    expect(pkg.scripts['db:verify:remote-drift']).toBe(
      'tsx platform/scripts/migration/verify-remote-drift.ts',
    );
  });

  it('has a remote migration dry-run script', () => {
    const script = read('platform/scripts/migration/dry-run-remote-migrations.ts');
    expect(script).toContain("'staging'");
    expect(script).toContain("'production'");
    expect(script).toContain('supabase db push --dry-run');
    expect(script).toContain('Restoring previous linked project');
  });

  it('exposes staging and production dry-run package scripts', () => {
    const pkg = JSON.parse(read('package.json'));
    expect(pkg.scripts['db:dry-run:staging']).toBe(
      'tsx platform/scripts/migration/dry-run-remote-migrations.ts --env staging',
    );
    expect(pkg.scripts['db:dry-run:production']).toBe(
      'tsx platform/scripts/migration/dry-run-remote-migrations.ts --env production',
    );
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
    expect(rebaseline).toContain(
      'DROP TRIGGER IF EXISTS "sync-algolia-webhook" ON "public"."parts"',
    );
    expect(rebaseline).toContain(
      'DROP TRIGGER IF EXISTS "notify-new-message" ON "public"."messages"',
    );
  });
});
