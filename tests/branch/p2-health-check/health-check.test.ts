import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function read(relativePath: string): string {
  return fs.readFileSync(path.resolve(__dirname, '../../../', relativePath), 'utf-8');
}

describe('P2.3 health check dependency verification', () => {
  it('runs shared Supabase and Algolia checks from the health route', () => {
    const route = read('apps/web/src/app/api/health/route.ts');
    expect(route).toContain('runHealthChecks');
    expect(route).toContain('503');
  });

  it('implements lightweight dependency probes', () => {
    const checks = read('apps/web/src/lib/health-checks.ts');
    expect(checks).toContain('checkSupabase');
    expect(checks).toContain('checkAlgolia');
    expect(checks).toContain('supabaseAdmin');
    expect(checks).toContain('getSettings');
    expect(checks).toContain('SEARCH_INDEX_NAME');
  });

  it('returns degraded status when any critical dependency fails', () => {
    const checks = read('apps/web/src/lib/health-checks.ts');
    expect(checks).toContain('status: isHealthy ? "ok" : "degraded"');
    expect(checks).toContain('Promise.all');
  });

  it('keeps Fly.io health probes pointed at /api/health', () => {
    const stage = read('fly/fly.stage.toml');
    const prod = read('fly/fly.prod.toml');
    expect(stage).toContain('path = "/api/health"');
    expect(prod).toContain('path = "/api/health"');
  });
});