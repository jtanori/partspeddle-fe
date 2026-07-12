import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const repoRoot = path.resolve(__dirname, '../../..');

describe('P4.4 validate local migration replay', () => {
  describe('platform/scripts/migration/compare-schema.ts', () => {
    it('exists', () => {
      expect(fs.existsSync(path.join(repoRoot, 'platform', 'scripts', 'migration', 'compare-schema.ts'))).toBe(true);
    });
  });

  describe('package.json scripts', () => {
    const pkg = JSON.parse(fs.readFileSync(path.join(repoRoot, 'package.json'), 'utf-8')) as Record<
      string,
      unknown
    >;

    it('exposes db:validate:replay', () => {
      const scripts = pkg.scripts as Record<string, string>;
      expect(scripts['db:validate:replay']).toBeDefined();
      expect(scripts['db:validate:replay']).toContain('compare-schema');
    });
  });

  describe('supabase/migrations/', () => {
    const migrationsDir = path.join(repoRoot, 'supabase', 'migrations');

    it('contains the rebaseline migration set and allows feature migrations', () => {
      const files = fs.existsSync(migrationsDir)
        ? fs
            .readdirSync(migrationsDir)
            .filter((f) => f.endsWith('.sql'))
            .sort()
        : [];
      expect(files.length).toBeGreaterThanOrEqual(3);
      expect(files).toEqual(
        expect.arrayContaining([
          '20260704000000_rebaseline_public_schema.sql',
          '20260704000001_rebaseline_storage_assets.sql',
          '20260704000002_rebaseline_auth_role_sync.sql',
        ]),
      );
    });

    it('no longer archives historical migrations in the active path', () => {
      const archiveDir = path.join(migrationsDir, 'archive');
      expect(fs.existsSync(archiveDir)).toBe(false);
    });
  });
});
