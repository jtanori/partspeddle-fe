import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function read(relativePath: string): string {
  return fs.readFileSync(path.resolve(__dirname, '../../../', relativePath), 'utf-8');
}

describe('P1.9 mobile filters, part detail and admin pages', () => {
  it('makes ProductSidebar padding responsive', () => {
    const source = read('apps/web/src/components/ProductSidebar.tsx');
    expect(source).toContain('p-4 sm:p-5');
  });

  it('widens the mobile filter sheet on larger phones', () => {
    const source = read('apps/web/src/components/search/MobileFilterSheet.tsx');
    expect(source).toContain('sm:w-[360px]');
  });

  it('makes the PDP gallery responsive for mobile', () => {
    const source = read('apps/web/src/components/pdp-modern/ProductGallery.tsx');
    expect(source).toContain('flex-col-reverse md:flex-row');
    expect(source).toContain('h-[300px] sm:h-[380px] md:h-auto');
  });

  it('makes the PDP tab navigation scrollable on small screens', () => {
    const source = read('apps/web/src/components/pdp-modern/TabSystem.tsx');
    expect(source).toContain('overflow-x-auto');
    expect(source).toContain('px-4 sm:px-8');
  });

  it('wraps the admin violation table for horizontal scrolling', () => {
    const source = read('apps/web/src/components/scgs/dashboard/ViolationTable.tsx');
    expect(source).toContain('overflow-x-auto');
    expect(source).toContain('min-w-[400px]');
  });

  it('adds a mobile menu toggle to the dashboard layout', () => {
    const source = read('apps/web/src/app/(dashboard)/layout.tsx');
    expect(source).toContain('isMobileMenuOpen');
    expect(source).toContain('<Menu className');
    expect(source).toContain('md:hidden');
  });
});
