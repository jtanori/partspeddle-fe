import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();
const exists = (...segments: string[]) => fs.existsSync(path.join(repoRoot, ...segments));
const read = (...segments: string[]) => fs.readFileSync(path.join(repoRoot, ...segments), 'utf-8');

const ROUTE_GROUPS = ['(public)', '(auth)', '(dashboard)', '(seller)', '(admin)'];

function walkDir(dir: string): string[] {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files: string[] = [];
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...walkDir(fullPath));
    } else {
      files.push(fullPath);
    }
  }
  return files;
}

describe('P5.1 App Router route-group conventions', () => {
  it('has all required route groups under apps/web/src/app', () => {
    for (const group of ROUTE_GROUPS) {
      expect(
        exists('apps', 'web', 'src', 'app', group, 'layout.tsx'),
        `Expected apps/web/src/app/${group}/layout.tsx`,
      ).toBe(true);
    }
  });

  it('has loading.tsx and error.tsx in every route group', () => {
    for (const group of ROUTE_GROUPS) {
      expect(
        exists('apps', 'web', 'src', 'app', group, 'loading.tsx'),
        `Expected apps/web/src/app/${group}/loading.tsx`,
      ).toBe(true);
      expect(exists('apps', 'web', 'src', 'app', group, 'error.tsx'), `Expected apps/web/src/app/${group}/error.tsx`).toBe(
        true,
      );
    }
  });

  it('does not have an orphan root page.tsx', () => {
    expect(exists('apps', 'web', 'src', 'app', 'page.tsx')).toBe(false);
  });

  it('keeps scgs under the (admin) route group', () => {
    expect(exists('apps', 'web', 'src', 'app', '(admin)', 'scgs')).toBe(true);
    expect(exists('apps', 'web', 'src', 'app', 'scgs')).toBe(false);
  });

  it('does not retain duplicate backend contracts HTTP handlers', () => {
    const backendRoot = path.join(repoRoot, 'apps', 'web', 'src', 'backend', 'modules');
    if (!exists('apps', 'web', 'src', 'backend', 'modules')) {
      return;
    }
    const allFiles = walkDir(backendRoot);
    const offenders = allFiles.filter((file) => file.includes(`${path.sep}contracts${path.sep}`));
    expect(offenders).toEqual([]);
  });
});

describe('P5.1 route-group loading and error UX', () => {
  it('auth loading renders a centered skeleton', () => {
    const source = read('apps', 'web', 'src', 'app', '(auth)', 'loading.tsx');
    expect(source).toContain('Skeleton');
    expect(source).toContain('flex-col');
  });

  it('auth error renders a reset button', () => {
    const source = read('apps', 'web', 'src', 'app', '(auth)', 'error.tsx');
    expect(source).toContain("'use client'");
    expect(source).toContain('Button');
    expect(source).toContain('reset');
  });

  it('seller loading matches workspace content skeleton pattern', () => {
    const source = read('apps', 'web', 'src', 'app', '(seller)', 'loading.tsx');
    expect(source).toContain('max-w-7xl');
    expect(source).toContain('Skeleton');
  });

  it('admin error renders a reset button', () => {
    const source = read('apps', 'web', 'src', 'app', '(admin)', 'error.tsx');
    expect(source).toContain("'use client'");
    expect(source).toContain('Button');
  });
});
