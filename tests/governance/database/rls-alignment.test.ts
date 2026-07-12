import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('P5.7 database security alignment', () => {
  it('migration file adds RLS policies for parts and seller_profiles', () => {
    const migrationPath = path.resolve(
      process.cwd(),
      'supabase',
      'migrations',
      '20260709210000_p5_7_rls_alignment.sql',
    );
    const content = fs.readFileSync(migrationPath, 'utf-8');
    expect(content).toContain('parts_public_select');
    expect(content).toContain('seller_profiles_public_select');
    expect(content).toContain('ALTER TABLE "public"."parts" ENABLE ROW LEVEL SECURITY');
    expect(content).toContain('ALTER TABLE "public"."seller_profiles" ENABLE ROW LEVEL SECURITY');
  });

  it('schema.sql enables RLS on parts and seller_profiles', () => {
    const schemaPath = path.resolve(process.cwd(), 'supabase', 'SCHEMA.sql');
    const content = fs.readFileSync(schemaPath, 'utf-8');
    expect(content).toContain('ALTER TABLE "public"."parts" ENABLE ROW LEVEL SECURITY');
    expect(content).toContain('ALTER TABLE "public"."seller_profiles" ENABLE ROW LEVEL SECURITY');
  });
});
