import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function read(relativePath: string): string {
  return fs.readFileSync(path.resolve(__dirname, '../../../', relativePath), 'utf-8');
}

describe('P1.8 mobile search and homepage layout overflows', () => {
  it('does not read window.innerWidth during SearchModal render', () => {
    const source = read('src/components/SearchModal.tsx');
    expect(source).not.toContain('window.innerWidth');
  });

  it('always applies the swipe transform via inline style (SSR-safe)', () => {
    const source = read('src/components/SearchModal.tsx');
    expect(source).toContain('transform: `translateY(${translateY}px)`');
  });

  it('stacks the hero search form vertically on mobile', () => {
    const source = read('src/components/homepage/HeroSection.tsx');
    expect(source).toContain('flex flex-col sm:flex-row');
    expect(source).not.toMatch(/absolute.*right-.*top-1\/2/);
  });

  it('routes mobile search icon to the global SearchModal instead of the dedicated sheet', () => {
    const mobileNav = read('src/components/navbar/shared/MobileNavbar.tsx');
    expect(mobileNav).toContain('onOpenSearchModal?.()');
    expect(mobileNav).not.toContain('MobileSearchSheet');
  });

  it('wires MobileFilterSheet into the search page for mobile breakpoints', () => {
    const searchPage = read('src/components/search/SearchPageClient.tsx');
    expect(searchPage).toContain('MobileFilterSheet');
    expect(searchPage).toContain('md:hidden');
  });

  it('adds bottom padding to main content to clear the mobile tab bar', () => {
    const publicShell = read('src/components/layout/PublicShell.tsx');
    expect(publicShell).toContain('pb-16 md:pb-0');
  });
});
