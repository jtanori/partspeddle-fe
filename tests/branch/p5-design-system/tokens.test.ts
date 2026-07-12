import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();
const read = (...segments: string[]) => fs.readFileSync(path.join(repoRoot, ...segments), 'utf-8');

describe('P5.0 design tokens', () => {
  const css = read('src', 'index.css');
  const tailwindConfig = read('packages', 'config', 'tailwind.config.ts');
  const pdprRoot = read('src', 'components', 'pdp-modern', 'PDPRoot.tsx');

  it('exposes the new systematic token set in src/index.css', () => {
    const lowerCss = css.toLowerCase();
    expect(lowerCss).toContain('--container-max: 1440px');
    expect(lowerCss).toContain('--content-max: 1280px');
    expect(lowerCss).toContain('--grid-gutter: 24px');
    expect(lowerCss).toContain('--spacing-5: 24px');
    expect(lowerCss).toContain('--radius-xl: 16px');
    expect(lowerCss).toContain('--text-hero: 36px');
    expect(lowerCss).toContain('--color-brand-primary: #b87333');
    expect(lowerCss).toContain('--color-surface-secondary: #f5f0eb');
    expect(lowerCss).toContain('--color-foreground-primary: #1e1e1e');
    expect(lowerCss).toContain('--color-stroke-subtle: #e5e0da');
    expect(lowerCss).toContain('--shadow-card:');
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

  it('new Phase 2 components avoid hardcoded hex values', () => {
    const dirs = [
      path.join(repoRoot, 'src', 'components', 'ui'),
      path.join(repoRoot, 'src', 'components', 'design-system'),
      path.join(repoRoot, 'src', 'components', 'pdp-modern'),
    ];
    const hexPattern = /#(?:[0-9a-fA-F]{3}){1,2}/;
    const legacyPattern = /(?:bg|text|border|rounded)-pp-/;

    for (const dir of dirs) {
      const files = fs.readdirSync(dir).filter((f) => f.endsWith('.tsx'));
      for (const file of files) {
        const source = fs.readFileSync(path.join(dir, file), 'utf-8');
        expect(source).not.toMatch(hexPattern);
        expect(source).not.toMatch(legacyPattern);
      }
    }
  });
});
