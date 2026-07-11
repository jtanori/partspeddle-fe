import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const repoRoot = path.resolve(__dirname, '../../..');

function readFile(...segments: string[]): string {
  return fs.readFileSync(path.join(repoRoot, ...segments), 'utf-8');
}

const combinedSql = [
  readFile('supabase', 'SCHEMA.sql'),
  ...fs
    .readdirSync(path.join(repoRoot, 'supabase', 'migrations'))
    .filter((f) => f.endsWith('.sql'))
    .sort()
    .map((f) => readFile('supabase', 'migrations', f)),
].join('\n');

const functionBlockRegex =
  /CREATE\s+OR\s+REPLACE\s+FUNCTION\s+"public"\."([^"]+)"[\s\S]*?AS\s+\$\$/gi;

function publicFunctionBlocks(sql: string): Array<{ name: string; body: string }> {
  const blocks: Array<{ name: string; body: string }> = [];
  let match: RegExpExecArray | null;
  while ((match = functionBlockRegex.exec(sql)) !== null) {
    blocks.push({ name: match[1], body: match[0] });
  }
  return blocks;
}

describe('P4.6 database security audit critical fixes', () => {
  describe('public.user_roles table', () => {
    it('is created in the auth role-sync migration', () => {
      const migration = readFile(
        'supabase',
        'migrations',
        '20260704000002_rebaseline_auth_role_sync.sql',
      );
      expect(migration).toContain('CREATE TABLE IF NOT EXISTS public.user_roles');
      expect(migration).toContain('user_id uuid PRIMARY KEY REFERENCES auth.users');
      expect(migration).toContain("CHECK (role IN ('buyer', 'seller', 'admin'))");
    });

    it('is present in the compiled SCHEMA.sql reference', () => {
      const schema = readFile('supabase', 'SCHEMA.sql');
      expect(schema).toContain('CREATE TABLE IF NOT EXISTS public.user_roles');
    });
  });

  describe('handle_new_user_role', () => {
    const migration = readFile(
      'supabase',
      'migrations',
      '20260704000002_rebaseline_auth_role_sync.sql',
    );

    it('does not derive role from client-controllable raw_user_meta_data', () => {
      expect(migration).not.toContain("raw_user_meta_data ->> 'role'");
      expect(migration).not.toContain('raw_user_meta_data ->> "role"');
    });

    it('always assigns buyer on sign-up', () => {
      expect(migration).toContain("VALUES (NEW.id, 'buyer')");
    });
  });

  describe('SECURITY DEFINER functions', () => {
    const blocks = publicFunctionBlocks(combinedSql);

    it('have SET search_path = public, pg_temp when SECURITY DEFINER', () => {
      const offenders = [
        ...new Set(
          blocks
            .filter(
              (b) =>
                /SECURITY\s+DEFINER/i.test(b.body) &&
                !/SET\s+"?search_path"?\s*(?:=|TO)\s*['"]?public['"]?,\s*['"]?pg_temp['"]?/i.test(
                  b.body,
                ),
            )
            .map((b) => b.name),
        ),
      ];

      expect(offenders).toEqual([]);
    });
  });

  describe('legacy synchronous webhook triggers', () => {
    it('are dropped in the rebaseline migration', () => {
      const migration = readFile(
        'supabase',
        'migrations',
        '20260704000000_rebaseline_public_schema.sql',
      );
      expect(migration).toContain(
        'DROP TRIGGER IF EXISTS "sync-algolia-webhook" ON "public"."parts"',
      );
      expect(migration).toContain(
        'DROP TRIGGER IF EXISTS "notify-new-message" ON "public"."messages"',
      );
    });
  });

  describe('analyze-part-image Edge Function', () => {
    const source = readFile('supabase', 'functions', 'analyze-part-image', 'index.ts');

    it('requires a valid Bearer JWT', () => {
      expect(source).toContain('verifyUserJwt');
      expect(source).toContain('authorization');
      expect(source).toContain('Missing or invalid authorization token');
    });

    it('still validates image inputs', () => {
      expect(source).toContain('ALLOWED_MIME_TYPES');
      expect(source).toContain('MAX_FILE_SIZE_BYTES');
      expect(source).toContain('MAX_FILES');
    });
  });
});
