import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function read(relativePath: string): string {
  return fs.readFileSync(path.resolve(__dirname, '../../../', relativePath), 'utf-8');
}

function exists(relativePath: string): boolean {
  return fs.existsSync(path.resolve(__dirname, '../../../', relativePath));
}

describe('P5.0 Phase 3 — marketplace convergence cleanup', () => {
  it('uses PPDS surface tokens in the root layout', () => {
    const layout = read('apps/web/src/app/layout.tsx');
    expect(layout).toContain('bg-surface-secondary');
    expect(layout).toContain('text-foreground-primary');
    expect(layout).not.toContain('bg-base-cream');
    expect(layout).not.toContain('text-steel-black');
  });

  it('uses PPDS surface tokens on the listing page wrapper', () => {
    const listing = read('apps/web/src/app/(public)/listing/[id]/page.tsx');
    expect(listing).toContain('bg-surface-secondary');
    expect(listing).not.toContain('bg-base-cream');
  });

  it('uses PPDS tokens in the public shell', () => {
    const shell = read('apps/web/src/components/layout/PublicShell.tsx');
    expect(shell).toContain('bg-surface-secondary');
    expect(shell).toContain('text-foreground-primary');
    expect(shell).not.toContain('bg-base-cream');
    expect(shell).not.toContain('text-steel-black');
  });

  it('uses PPDS tokens in loading indicators', () => {
    const skeleton = read('apps/web/src/components/ui/skeleton.tsx');

    expect(skeleton).toContain('bg-surface-muted');
    expect(skeleton).toContain('bg-surface-primary');
    expect(skeleton).not.toContain('bg-[#0E0E0E]');
    expect(skeleton).not.toContain('text-[#B87333]');

    expect(exists('apps/web/src/components/common/MainLoadingIndicator.tsx')).toBe(false);
    expect(exists('apps/web/src/components/common/InlineLoadingIndicator.tsx')).toBe(false);
  });

  it('migrated all pdp-modern components away from legacy pp-* tokens', () => {
    const pdpDir = path.resolve(__dirname, '../../../apps/web/src/components/pdp-modern');
    const files = fs.readdirSync(pdpDir).filter((f) => f.endsWith('.tsx'));
    const legacyPattern =
      /(?:bg|text|border|rounded|px|py|gap|space-x|space-y)-pp-|["']pp-(?:primary|text|success|surface|card|gap|pad|atom)["'];/;

    for (const file of files) {
      const source = fs.readFileSync(path.join(pdpDir, file), 'utf-8');
      expect(source).not.toMatch(legacyPattern);
    }
  });

  it('migrated all pdp-modern components away from hardcoded hex colors', () => {
    const pdpDir = path.resolve(__dirname, '../../../apps/web/src/components/pdp-modern');
    const files = fs.readdirSync(pdpDir).filter((f) => f.endsWith('.tsx'));
    const hexPattern = /#(?:[0-9a-fA-F]{3}){1,2}/;

    for (const file of files) {
      const source = fs.readFileSync(path.join(pdpDir, file), 'utf-8');
      expect(source).not.toMatch(hexPattern);
    }
  });
});
