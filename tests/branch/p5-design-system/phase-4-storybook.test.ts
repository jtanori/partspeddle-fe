import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function read(relativePath: string): string {
  return fs.readFileSync(path.resolve(__dirname, '../../../', relativePath), 'utf-8');
}

function exists(relativePath: string): boolean {
  return fs.existsSync(path.resolve(__dirname, '../../../', relativePath));
}

describe('P5.0 Phase 4 — PPDS Documentation & Storybook', () => {
  it('has a PPDS documentation index', () => {
    expect(exists('docs/design-system/README.md')).toBe(true);
    const readme = read('docs/design-system/README.md');
    expect(readme).toContain('PartsPeddle Product Design System');
    expect(readme).toContain('00-philosophy.md');
    expect(readme).toContain('06-component-library.md');
    expect(readme).toContain('figma-mapping.md');
  });

  it('documents layout, typography, and the component library', () => {
    expect(exists('docs/design-system/02-layout-system.md')).toBe(true);
    expect(exists('docs/design-system/03-typography.md')).toBe(true);
    expect(exists('docs/design-system/06-component-library.md')).toBe(true);

    const layout = read('docs/design-system/02-layout-system.md');
    expect(layout).toContain('Container');
    expect(layout).toContain('Content');
    expect(layout).toContain('Section');

    const typography = read('docs/design-system/03-typography.md');
    expect(typography).toContain('Lucide only');

    const components = read('docs/design-system/06-component-library.md');
    expect(components).toContain('Input');
    expect(components).toContain('Storybook');
  });

  it('configures Storybook with the react-vite framework', () => {
    expect(exists('.storybook/main.ts')).toBe(true);
    const main = read('.storybook/main.ts');
    expect(main).toContain('@storybook/react-vite');
    expect(main).toContain('@storybook/addon-essentials');
    expect(main).toContain('@storybook/addon-a11y');

    expect(exists('.storybook/preview.ts')).toBe(true);
    const preview = read('.storybook/preview.ts');
    expect(preview).toContain('import');
    expect(preview).toContain("layout: 'padded'");
  });

  it('declares Storybook scripts in package.json', () => {
    const pkg = read('package.json');
    expect(pkg).toContain('"storybook": "storybook dev -p 6006"');
    expect(pkg).toContain('"storybook:build": "storybook build"');
  });

  it('has stories for UI primitives', () => {
    const primitives = [
      'apps/web/src/components/ui/button.stories.tsx',
      'apps/web/src/components/ui/badge.stories.tsx',
      'apps/web/src/components/ui/card.stories.tsx',
      'apps/web/src/components/ui/chip.stories.tsx',
      'apps/web/src/components/ui/skeleton.stories.tsx',
      'apps/web/src/components/ui/tabs.stories.tsx',
      'apps/web/src/components/ui/accordion.stories.tsx',
      'apps/web/src/components/ui/breadcrumb.stories.tsx',
      'apps/web/src/components/ui/pagination.stories.tsx',
      'apps/web/src/components/ui/search-input.stories.tsx',
      'apps/web/src/components/ui/filter-group.stories.tsx',
      'apps/web/src/components/ui/modal.stories.tsx',
      'apps/web/src/components/ui/drawer.stories.tsx',
      'apps/web/src/components/ui/toast.stories.tsx',
      'apps/web/src/components/ui/tooltip.stories.tsx',
      'apps/web/src/components/ui/scroll-area.stories.tsx',
      'apps/web/src/components/ui/sheet.stories.tsx',
    ];
    for (const file of primitives) {
      expect(exists(file), `Expected ${file} to exist`).toBe(true);
    }
  });

  it('has stories for design-system composites', () => {
    const composites = [
      'apps/web/src/components/design-system/price.stories.tsx',
      'apps/web/src/components/design-system/rating.stories.tsx',
      'apps/web/src/components/design-system/inventory-count.stories.tsx',
      'apps/web/src/components/design-system/seller-summary.stories.tsx',
      'apps/web/src/components/design-system/image-gallery.stories.tsx',
      'apps/web/src/components/design-system/specification-table.stories.tsx',
      'apps/web/src/components/design-system/vehicle-lineage.stories.tsx',
      'apps/web/src/components/design-system/part-card.stories.tsx',
      'apps/web/src/components/design-system/seller-card.stories.tsx',
    ];
    for (const file of composites) {
      expect(exists(file), `Expected ${file} to exist`).toBe(true);
    }
  });

  it('has stories for workspace shell components', () => {
    const workspace = [
      'apps/web/src/components/workspace/workspace-layout.stories.tsx',
      'apps/web/src/components/workspace/top-navigation.stories.tsx',
      'apps/web/src/components/workspace/toolbar.stories.tsx',
      'apps/web/src/components/workspace/sidebar.stories.tsx',
      'apps/web/src/components/workspace/page-header.stories.tsx',
      'apps/web/src/components/workspace/inspector-panel.stories.tsx',
      'apps/web/src/components/workspace/density-provider.stories.tsx',
    ];
    for (const file of workspace) {
      expect(exists(file), `Expected ${file} to exist`).toBe(true);
    }
  });

  it('has shared fixtures for stories', () => {
    expect(exists('apps/web/src/components/__fixtures__/parts.ts')).toBe(true);
    expect(exists('apps/web/src/components/__fixtures__/sellers.ts')).toBe(true);
  });

  it(
    'builds Storybook successfully',
    { timeout: 1_800_000 },
    () => {
      const projectRoot = path.resolve(__dirname, '../../../');
      execSync('pnpm storybook:build', {
        cwd: projectRoot,
        stdio: 'pipe',
        timeout: 1_740_000,
      });
      expect(exists('storybook-static/index.html')).toBe(true);
    }
  );
});
