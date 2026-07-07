import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const repoRoot = path.resolve(__dirname, '../../..');
const ciPath = path.join(repoRoot, '.github', 'workflows', 'ci.yml');

describe('P4.5 exercise Supabase CI/CD end-to-end', () => {
  describe('scripts/ci/smoke-staging.ts', () => {
    it('exists', () => {
      expect(fs.existsSync(path.join(repoRoot, 'scripts', 'ci', 'smoke-staging.ts'))).toBe(true);
    });
  });

  describe('.github/workflows/ci.yml', () => {
    const workflow = fs.existsSync(ciPath) ? fs.readFileSync(ciPath, 'utf-8') : '';

    it('contains a smoke-staging job', () => {
      expect(workflow).toMatch(/smoke-staging:/);
    });

    it('runs smoke-staging after Fly.io and Supabase staging deploys', () => {
      expect(workflow).toMatch(
        /smoke-staging:[\s\S]*?needs:\s*\[deploy-staging,\s*deploy-supabase-staging\]/m,
      );
    });

    it('only runs smoke-staging on develop pushes', () => {
      expect(workflow).toMatch(/smoke-staging:[\s\S]*?github\.ref == 'refs\/heads\/develop'/m);
    });
  });

  describe('package.json', () => {
    const pkg = JSON.parse(fs.readFileSync(path.join(repoRoot, 'package.json'), 'utf-8')) as Record<
      string,
      unknown
    >;

    it('exposes ci:smoke:staging', () => {
      const scripts = pkg.scripts as Record<string, string>;
      expect(scripts['ci:smoke:staging']).toBeDefined();
      expect(scripts['ci:smoke:staging']).toContain('smoke-staging');
    });
  });

  describe('docs/DEPLOYMENT_RUNBOOK.md', () => {
    const runbook = fs.readFileSync(path.join(repoRoot, 'docs', 'DEPLOYMENT_RUNBOOK.md'), 'utf-8');

    it('documents end-to-end deploy verification', () => {
      expect(runbook).toMatch(/^#+ .*End-to-end deploy verification/m);
    });

    it('includes an evidence template', () => {
      expect(runbook).toMatch(/evidence/i);
      expect(runbook).toContain('CI run URL');
    });
  });
});
