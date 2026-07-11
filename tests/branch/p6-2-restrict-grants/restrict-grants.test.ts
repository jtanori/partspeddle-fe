import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function read(relativePath: string): string {
  return fs.readFileSync(path.resolve(__dirname, '../../../', relativePath), 'utf-8');
}

describe('P6.2 restrict grants and default privileges', () => {
  it('has a migration that revokes excessive grants', () => {
    const migration = read('supabase/migrations/20260711000000_restrict_grants.sql');
    expect(migration).toContain('REVOKE ALL ON TABLE');
    expect(migration).toContain('REVOKE ALL ON ALL FUNCTIONS IN SCHEMA "public"');
    expect(migration).toContain('REVOKE ALL ON TABLES FROM "anon", "authenticated"');
    expect(migration).toContain('REVOKE ALL ON FUNCTIONS FROM "anon", "authenticated"');
    expect(migration).toContain('REVOKE ALL ON SEQUENCES FROM "anon", "authenticated"');
  });

  it('grants no privileges to anon/authenticated on sensitive tables', () => {
    const migration = read('supabase/migrations/20260711000000_restrict_grants.sql');
    expect(migration).not.toMatch(
      /GRANT .* ON "public"\.("audit_log"|"fraud_events"|"risk_scores"|"search_outbox"|"search_request_metrics"|"search_worker_runs"|"search_audit_runs") TO ("anon"|"authenticated")/,
    );
  });

  it('denies write access to internal operational tables for anon/authenticated', () => {
    const migration = read('supabase/migrations/20260711000000_restrict_grants.sql');
    expect(migration).not.toMatch(
      /GRANT (INSERT|UPDATE|DELETE) ON "public"\."(fraud_events|risk_scores|search_outbox|search_request_metrics|search_worker_runs|search_audit_runs)"/,
    );
  });

  it('preserves service_role access', () => {
    const migration = read('supabase/migrations/20260711000000_restrict_grants.sql');
    expect(migration).toContain('GRANT ALL ON ALL TABLES IN SCHEMA "public" TO "service_role"');
  });

  it('documents the grant model in RLS_POLICY_MAP.md', () => {
    const map = read('docs/RLS_POLICY_MAP.md');
    expect(map).toContain('service_role');
    expect(map).toContain('authenticated');
    expect(map).toContain('anon');
  });
});
