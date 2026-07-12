import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const repoRoot = path.resolve(__dirname, '../../..');
const ciPath = path.join(repoRoot, '.github', 'workflows', 'ci.yml');

describe('P4.5 exercise Supabase CI/CD end-to-end', () => {
  describe('platform/scripts/ci/smoke-staging.ts', () => {
    it('exists', () => {
      expect(fs.existsSync(path.join(repoRoot, 'platform', 'scripts', 'ci', 'smoke-staging.ts'))).toBe(true);
    });
  });

  describe('.github/workflows/ci.yml', () => {
    const workflow = fs.existsSync(ciPath) ? fs.readFileSync(ciPath, 'utf-8') : '';

    it('contains a smoke-tests job', () => {
      expect(workflow).toMatch(/smoke-tests:/);
    });

    it('runs smoke-tests after Fly.io and Supabase deploys', () => {
      expect(workflow).toMatch(
        /smoke-tests:[\s\S]*?needs:\s*\[configure,\s*deploy-fly,\s*deploy-supabase\]/m,
      );
    });

    it('only runs smoke-tests on delivery branches', () => {
      expect(workflow).toMatch(/smoke-tests:[\s\S]*?needs\.configure\.outputs\.is-delivery-branch == 'true'/m);
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
