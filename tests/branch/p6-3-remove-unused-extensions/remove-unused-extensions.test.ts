import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function read(relativePath: string): string {
  return fs.readFileSync(path.resolve(__dirname, '../../../', relativePath), 'utf-8');
}

describe('P6.3 remove unused Postgres extensions', () => {
  it('drops the four unused extensions in a migration', () => {
    const migration = read('supabase/migrations/20260712000000_drop_unused_extensions.sql');
    expect(migration).toContain('DROP EXTENSION IF EXISTS "pg_net"');
    expect(migration).toContain('DROP EXTENSION IF EXISTS "pg_graphql"');
    expect(migration).toContain('DROP EXTENSION IF EXISTS "supabase_vault"');
    expect(migration).toContain('DROP EXTENSION IF EXISTS "uuid-ossp"');
  });

  it('keeps pgcrypto and pg_stat_statements', () => {
    const migration = read('supabase/migrations/20260712000000_drop_unused_extensions.sql');
    expect(migration).not.toContain('DROP EXTENSION IF EXISTS "pgcrypto"');
    expect(migration).not.toContain('DROP EXTENSION IF EXISTS "pg_stat_statements"');
  });

  it('removes unused extension CREATE statements from SCHEMA.sql', () => {
    const schema = read('supabase/SCHEMA.sql');
    expect(schema).not.toContain('CREATE EXTENSION IF NOT EXISTS "pg_net"');
    expect(schema).not.toContain('CREATE EXTENSION IF NOT EXISTS "pg_graphql"');
    expect(schema).not.toContain('CREATE EXTENSION IF NOT EXISTS "supabase_vault"');
    expect(schema).not.toContain('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
  });

  it('keeps required extensions in SCHEMA.sql', () => {
    const schema = read('supabase/SCHEMA.sql');
    expect(schema).toContain('CREATE EXTENSION IF NOT EXISTS "pgcrypto"');
    expect(schema).toContain('CREATE EXTENSION IF NOT EXISTS "pg_stat_statements"');
  });
});
