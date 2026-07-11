import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const repoRoot = path.resolve(__dirname, '../../..');
const ciPath = path.join(repoRoot, '.github', 'workflows', 'ci.yml');

function readWorkflow(): string {
  return fs.readFileSync(ciPath, 'utf-8');
}

describe('P4.1 Supabase CI/CD', () => {
  describe('.github/workflows/ci.yml', () => {
    it('exists', () => {
      expect(fs.existsSync(ciPath)).toBe(true);
    });

    const workflow = fs.existsSync(ciPath) ? readWorkflow() : '';

    it('uses the Supabase CLI setup action', () => {
      expect(workflow).toContain('supabase/setup-cli');
    });

    it('logs in with the access token', () => {
      expect(workflow).toContain('supabase login --token');
      expect(workflow).toContain('secrets.SUPABASE_ACCESS_TOKEN');
    });

    it('links staging and production projects', () => {
      expect(workflow).toContain('supabase link --project-ref');
      expect(workflow).toContain('STAGING_SUPABASE_PROJECT_ID');
      expect(workflow).toContain('PRODUCTION_SUPABASE_PROJECT_ID');
    });

    it('deploys database migrations', () => {
      expect(workflow).toContain('supabase db push');
    });

    it('deploys Edge Functions', () => {
      expect(workflow).toContain('supabase functions deploy');
      expect(workflow).toContain('--use-api');
    });

    it('gates Supabase deploy on the test and configure jobs', () => {
      const sectionStart = workflow.indexOf('deploy-supabase:');
      const sectionEnd = workflow.indexOf('smoke-tests:', sectionStart);
      const section = workflow.slice(sectionStart, sectionEnd > sectionStart ? sectionEnd : undefined);
      expect(section).toContain('needs: [test, configure]');
    });

    it('supports manual dry-run dispatch', () => {
      expect(workflow).toContain('workflow_dispatch');
      expect(workflow).toContain('dry-run');
    });
  });

  describe('docs/DEPLOYMENT_RUNBOOK.md', () => {
    const runbook = fs.readFileSync(path.join(repoRoot, 'docs', 'DEPLOYMENT_RUNBOOK.md'), 'utf-8');

    it('documents Supabase CI/CD', () => {
      expect(runbook).toMatch(/^#+ .*Supabase CI\/CD/m);
    });

    it('documents dry-run and rollback', () => {
      expect(runbook).toMatch(/dry-run/i);
      expect(runbook).toMatch(/rollback/i);
    });
  });

  describe('package.json', () => {
    const pkg = JSON.parse(fs.readFileSync(path.join(repoRoot, 'package.json'), 'utf-8')) as Record<
      string,
      unknown
    >;

    it('exposes a db deploy dry-run script', () => {
      const scripts = pkg.scripts as Record<string, string>;
      expect(scripts['db:deploy:dry-run']).toBeDefined();
    });
  });
});
