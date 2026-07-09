import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

function readSource(relativePath: string) {
  return readFileSync(resolve(process.cwd(), relativePath), 'utf-8');
}

describe('P5.0 Deploy & Environment Secrets Review', () => {
  describe('Fly.io configuration', () => {
    it('staging fly.toml targets vintrack-stage', () => {
      const source = readSource('fly/fly.stage.toml');
      expect(source).toContain('app = "vintrack-stage"');
      expect(source).toContain('force_https = true');
      expect(source).toContain('path = "/api/health"');
    });

    it('production fly.toml targets vintrack-prod', () => {
      const source = readSource('fly/fly.prod.toml');
      expect(source).toContain('app = "vintrack-prod"');
      expect(source).toContain('force_https = true');
      expect(source).toContain('path = "/api/health"');
    });
  });

  describe('.env.example classification', () => {
    it('exists and documents variable classification', () => {
      const source = readSource('.env.example');
      expect(source).toContain('NEXT_PUBLIC_*');
      expect(source).toContain('Server-only');
      expect(source).toContain('CI/Deploy-only');
    });

    it('lists required runtime secrets', () => {
      const source = readSource('.env.example');
      expect(source).toContain('SUPABASE_URL=');
      expect(source).toContain('SUPABASE_ANON_KEY=');
      expect(source).toContain('SUPABASE_SERVICE_ROLE_KEY=');
      expect(source).toContain('ALGOLIA_APP_ID=');
      expect(source).toContain('ALGOLIA_ADMIN_KEY=');
      expect(source).toContain('GEMINI_API_KEY=');
      expect(source).toContain('SUPABASE_WEBHOOK_SECRET=');
    });

    it('warns against shipping secrets to the browser', () => {
      const source = readSource('.env.example');
      expect(source).toContain('must never contain secrets');
      expect(source).toContain('do NOT use NEXT_PUBLIC_ prefix');
    });
  });

  describe('DEPLOYMENT_RUNBOOK.md', () => {
    it('documents Fly.io application secrets', () => {
      const source = readSource('docs/DEPLOYMENT_RUNBOOK.md');
      expect(source).toContain('Fly.io Application Secrets');
      expect(source).toContain('flyctl secrets set');
      expect(source).toContain('flyctl secrets list --app vintrack-stage');
      expect(source).toContain('flyctl secrets list --app vintrack-prod');
    });

    it('includes GEMINI_API_KEY in production secrets', () => {
      const source = readSource('docs/DEPLOYMENT_RUNBOOK.md');
      expect(source).toContain('GEMINI_API_KEY');
    });
  });

  describe('.planning/master-plan.md', () => {
    it('marks P5.0 Phase 3 as done', () => {
      const source = readSource('.planning/master-plan.md');
      const phase3Section = source.substring(
        source.indexOf('3. **Marketplace page convergence**'),
        source.indexOf('4. **PPDS documentation & Storybook**'),
      );
      expect(phase3Section).toContain('✅');
      expect(phase3Section).toContain('PR #60');
    });

    it('marks P5.0 Phase 6 as done', () => {
      const source = readSource('.planning/master-plan.md');
      const phase6Section = source.substring(
        source.indexOf('6. **Seller workspace shell**'),
        source.indexOf('7. **Deploy & environment secrets review**'),
      );
      expect(phase6Section).toContain('✅');
      expect(phase6Section).toContain('PR #61');
    });

    it('includes a deploy & environment secrets review phase', () => {
      const source = readSource('.planning/master-plan.md');
      expect(source).toContain('7. **Deploy & environment secrets review**');
      expect(source).toContain('vintrack-stage');
      expect(source).toContain('vintrack-prod');
    });
  });

  describe('CI workflow', () => {
    it('uses environment-scoped deployments', () => {
      const source = readSource('.github/workflows/ci.yml');
      expect(source).toContain('environment: staging');
      expect(source).toContain('environment: production');
      expect(source).toContain('FLY_API_TOKEN: ${{ secrets.FLY_API_TOKEN }}');
    });
  });
});
