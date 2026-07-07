import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();
const read = (...segments: string[]) => fs.readFileSync(path.join(repoRoot, ...segments), 'utf-8');

describe('P5.0 design tokens', () => {
  const css = read('src', 'index.css');
  const tailwindConfig = read('tailwind.config.ts');
  const pdprRoot = read('src', 'components', 'pdp-modern', 'PDPRoot.tsx');

  it('exposes the new systematic token set in src/index.css', () => {
    expect(css).toContain('--container-max: 1440px');
    expect(css).toContain('--content-max: 1280px');
    expect(css).toContain('--grid-gutter: 24px');
    expect(css).toContain('--spacing-5: 24px');
    expect(css).toContain('--radius-xl: 16px');
    expect(css).toContain('--text-hero: 36px');
    expect(css).toContain('--color-brand-primary: #B87333');
    expect(css).toContain('--color-surface-secondary: #F5F0EB');
    expect(css).toContain('--color-foreground-primary: #1E1E1E');
    expect(css).toContain('--color-stroke-subtle: #E5E0DA');
    expect(css).toContain('--shadow-card:');
  });

  it('keeps legacy pp-* aliases during the transition', () => {
    expect(tailwindConfig).toContain("'pp-primary': '#B87333'");
    expect(tailwindConfig).toContain("'pp-card': '8px'");
    expect(tailwindConfig).toContain("'pp-gap': '32px'");
    expect(tailwindConfig).toContain('Legacy aliases');
  });

  it('migrated PDPRoot away from key hardcoded values', () => {
    expect(pdprRoot).not.toContain('bg-[#F5F0EB]');
    expect(pdprRoot).not.toContain('max-w-[1280px]');
    expect(pdprRoot).not.toContain('rounded-pp-card');
    expect(pdprRoot).toContain('bg-surface-secondary');
    expect(pdprRoot).toContain('<Content');
    expect(pdprRoot).toContain('rounded-xl');
  });

  it('does not regress the pp-container component class', () => {
    expect(css).toContain('.pp-container');
  });
});
