import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const repoRoot = path.resolve(__dirname, '../../..');

function readFile(...segments: string[]): string {
  return fs.readFileSync(path.join(repoRoot, ...segments), 'utf-8');
}

describe('P4.3 rebaseline migrations from remote schema', () => {
  describe('supabase/baseline/', () => {
    const baselineDir = path.join(repoRoot, 'supabase', 'baseline');

    it('exists', () => {
      expect(fs.existsSync(baselineDir)).toBe(true);
    });

    it('contains a timestamped remote public schema dump', () => {
      const files = fs.existsSync(baselineDir)
        ? fs.readdirSync(baselineDir).filter((f) => f.endsWith('.sql'))
        : [];
      expect(files.length).toBeGreaterThanOrEqual(1);
      expect(files.some((f) => /remote_\d{8}_public\.sql$/.test(f))).toBe(true);
    });
  });

  describe('supabase/migrations/', () => {
    const migrationsDir = path.join(repoRoot, 'supabase', 'migrations');

    it('contains the three rebaseline migrations and allows feature migrations', () => {
      const topLevel = fs.existsSync(migrationsDir)
        ? fs
            .readdirSync(migrationsDir)
            .filter((f) => f.endsWith('.sql'))
            .sort()
        : [];
      expect(topLevel.length).toBeGreaterThanOrEqual(3);
      expect(topLevel).toEqual(
        expect.arrayContaining([
          '20260704000000_rebaseline_public_schema.sql',
          '20260704000001_rebaseline_storage_assets.sql',
          '20260704000002_rebaseline_auth_role_sync.sql',
        ]),
      );
    });

    it('no longer keeps historical migrations in the active path', () => {
      const archiveDir = path.join(migrationsDir, 'archive');
      expect(fs.existsSync(archiveDir)).toBe(false);
    });
  });

  describe('rebaseline migration contents', () => {
    const migrationsDir = path.join(repoRoot, 'supabase', 'migrations');
    const files = fs.existsSync(migrationsDir)
      ? fs.readdirSync(migrationsDir).filter((f) => f.endsWith('.sql'))
      : [];
    const combined = files.map((f) => readFile('supabase', 'migrations', f)).join('\n');

    it('covers extensions', () => {
      expect(combined).toMatch(/CREATE EXTENSION IF NOT EXISTS/i);
    });

    it('covers tables', () => {
      expect(combined).toMatch(/CREATE TABLE IF NOT EXISTS/i);
    });

    it('covers RLS policies', () => {
      expect(combined).toMatch(/CREATE POLICY/i);
    });

    it('covers functions and triggers', () => {
      expect(combined).toMatch(/CREATE OR REPLACE FUNCTION/i);
      expect(combined).toMatch(/CREATE OR REPLACE TRIGGER/i);
    });

    it('includes storage bucket and object policies', () => {
      const storageFile = files.find((f) => f.includes('storage_assets'));
      expect(storageFile).toBeDefined();
      const storage = storageFile ? readFile('supabase', 'migrations', storageFile) : '';
      expect(storage).toContain('storage.buckets');
      expect(storage).toContain('storage.objects');
    });

    it('includes auth role-sync trigger', () => {
      const authFile = files.find((f) => f.includes('auth_role_sync'));
      expect(authFile).toBeDefined();
      const auth = authFile ? readFile('supabase', 'migrations', authFile) : '';
      expect(auth).toContain('auth.users');
      expect(auth).toContain('public.user_roles');
    });
  });

  describe('supabase/SCHEMA.sql', () => {
    const schemaPath = path.join(repoRoot, 'supabase', 'SCHEMA.sql');

    it('exists and has been updated', () => {
      expect(fs.existsSync(schemaPath)).toBe(true);
    });

    const schema = fs.existsSync(schemaPath) ? readFile('supabase', 'SCHEMA.sql') : '';

    it('no longer carries the stale context-only warning header', () => {
      expect(schema).not.toContain('This schema is for context only and is not meant to be run.');
    });

    it('reflects the rebaseline', () => {
      expect(schema).toContain('P4.3 rebaseline');
    });
  });
});
