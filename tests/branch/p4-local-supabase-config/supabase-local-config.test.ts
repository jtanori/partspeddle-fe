import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const repoRoot = path.resolve(__dirname, '../../..');

function readFile(...segments: string[]): string {
  return fs.readFileSync(path.join(repoRoot, ...segments), 'utf-8');
}

describe('P4.2 local Supabase environment', () => {
  describe('supabase/config.toml', () => {
    const config = readFile('supabase', 'config.toml');

    it('declares a project_id', () => {
      expect(config).toMatch(/^project_id\s*=\s*"[^"]+"/m);
    });

    it.each(['sync-algolia-webhook', 'analyze-part-image', 'send-message-notification'])(
      'registers and enables the %s Edge Function',
      (name) => {
        expect(config).toContain(`[functions.${name}]`);
        const section = config.split(`[functions.${name}]`)[1]?.split(/^\[/m)[0] ?? '';
        expect(section).toContain('enabled = true');
        expect(section).toContain('entrypoint');
      },
    );
  });

  describe('supabase/.env.example', () => {
    const envExamplePath = path.join(repoRoot, 'supabase', '.env.example');

    it('exists', () => {
      expect(fs.existsSync(envExamplePath)).toBe(true);
    });

    const env = fs.existsSync(envExamplePath) ? readFile('supabase', '.env.example') : '';

    it.each([
      'SUPABASE_URL',
      'SUPABASE_ANON_KEY',
      'SUPABASE_SERVICE_ROLE_KEY',
      'ALGOLIA_APP_ID',
      'ALGOLIA_ADMIN_KEY',
      'SUPABASE_WEBHOOK_SECRET',
      'GEMINI_API_KEY',
    ])('documents %s', (key) => {
      expect(env).toMatch(new RegExp(`^${key}=`, 'm'));
    });
  });

  describe('package.json local DB scripts', () => {
    const pkg = JSON.parse(readFile('package.json')) as Record<string, unknown>;

    it('exposes db:local:* helpers', () => {
      const scripts = pkg.scripts as Record<string, string>;
      expect(scripts['db:local:up']).toBeDefined();
      expect(scripts['db:local:down']).toBeDefined();
      expect(scripts['db:local:status']).toBeDefined();
      expect(scripts['db:local:reset']).toBeDefined();
    });

    it('starts only db, postgrest, edge-runtime and kong locally', () => {
      const scripts = pkg.scripts as Record<string, string>;
      expect(scripts['db:local:up']).toContain(
        '-x gotrue,realtime,storage-api,imgproxy,mailpit,postgres-meta,studio,logflare,vector,supavisor',
      );
    });
  });

  describe('docs/DEPLOYMENT_RUNBOOK.md', () => {
    const runbook = readFile('docs', 'DEPLOYMENT_RUNBOOK.md');

    it('documents local Supabase development', () => {
      expect(runbook).toMatch(/^#.*Local Supabase development/m);
    });

    it('lists the required local service set', () => {
      expect(runbook).toContain('postgres');
      expect(runbook).toContain('gotrue');
      expect(runbook).toContain('edge-runtime');
    });
  });

  describe('docs/REMEDIATION_PLAN.md', () => {
    const plan = readFile('docs', 'REMEDIATION_PLAN.md');

    it('no longer places production Fly secrets in P3', () => {
      expect(plan).not.toContain('### P3.5 Update production Fly.io secrets');
    });

    it('places production Fly secrets after P5.8', () => {
      expect(plan).toContain('### P5.9 Update production Fly.io secrets');
    });
  });
});
