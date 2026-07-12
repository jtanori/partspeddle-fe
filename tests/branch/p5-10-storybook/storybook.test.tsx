import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

function readSource(relativePath: string): string {
  return readFileSync(resolve(process.cwd(), relativePath), 'utf-8');
}

describe('P5.10 Storybook Design System Documentation', () => {
  it('has Storybook configured', () => {
    const source = readSource('.storybook/main.ts');
    expect(source).toContain('stories');
  });

  it('has a canonical PDPRoot story', () => {
    const source = readSource('apps/web/src/components/pdp-modern/PDPRoot.stories.tsx');
    expect(source).toContain('PDPRoot');
    expect(source).toContain('export const Default');
  });

  it('CI workflow includes Storybook build gate', () => {
    const source = readSource('.github/workflows/ci.yml');
    expect(source).toContain('Storybook Build');
    expect(source).toContain('pnpm storybook:build');
  });

  it('has storybook build script in package.json', () => {
    const source = readSource('package.json');
    expect(source).toContain('"storybook:build"');
  });
});
