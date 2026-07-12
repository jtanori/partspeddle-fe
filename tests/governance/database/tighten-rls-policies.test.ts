import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function read(relativePath: string): string {
  return fs.readFileSync(path.resolve(__dirname, '../../../', relativePath), 'utf-8');
}

describe('P6.1 tighten overly permissive RLS policies', () => {
  it('has a migration that tightens part_images public read', () => {
    const migration = read('supabase/migrations/20260710000000_tighten_rls_policies.sql');
    expect(migration).toContain(
      'DROP POLICY IF EXISTS "Public read access" ON "public"."part_images"',
    );
    expect(migration).toContain('Public read access for available parts');
    expect(migration).toContain("p.status = 'AVAILABLE'");
  });

  it('removes user-facing fraud_events and risk_scores policies', () => {
    const migration = read('supabase/migrations/20260710000000_tighten_rls_policies.sql');
    expect(migration).toContain('DROP POLICY IF EXISTS "Users can view their own fraud events"');
    expect(migration).toContain('DROP POLICY IF EXISTS "Users can view their own risk scores"');
  });

  it('strengthens offers insert policy with part availability and seller match', () => {
    const migration = read('supabase/migrations/20260710000000_tighten_rls_policies.sql');
    expect(migration).toContain('Buyers can create offers for available parts');
    expect(migration).toContain(
      'SELECT seller_id FROM "public"."parts" WHERE id = part_id AND status =',
    );
  });

  it('strengthens conversations insert policy with part availability and seller match', () => {
    const migration = read('supabase/migrations/20260710000000_tighten_rls_policies.sql');
    expect(migration).toContain('Buyers can start conversations about available parts');
    expect(migration).toContain('p.seller_id = seller_id');
  });

  it('restricts seller_owns_profile to SELECT and UPDATE only', () => {
    const migration = read('supabase/migrations/20260710000000_tighten_rls_policies.sql');
    expect(migration).toContain('DROP POLICY IF EXISTS "seller_owns_profile"');
    expect(migration).toContain('seller_owns_profile_select');
    expect(migration).toContain('seller_owns_profile_update');
    expect(migration).not.toContain('FOR DELETE');
  });

});
