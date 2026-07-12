import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, '../../../');

function exists(relativePath: string): boolean {
  return fs.existsSync(path.join(root, relativePath));
}

function read(relativePath: string): string {
  return fs.readFileSync(path.join(root, relativePath), 'utf-8');
}

describe('P3.1 dead code and stale comment cleanup', () => {
  it('removes legacy Express search contract handlers', () => {
    expect(exists('apps/web/src/backend/modules/search/contracts')).toBe(false);
    expect(exists('apps/web/src/backend/modules/search/contracts/search-api-handler.ts')).toBe(
      false,
    );
    expect(exists('apps/web/src/backend/modules/search/contracts/search-suggestions-handler.ts')).toBe(
      false,
    );
  });

  it('removes orphaned legacy dashboard and dev-only components', () => {
    expect(exists('apps/web/src/components/SellerDashboard.tsx')).toBe(false);
    expect(exists('apps/web/src/components/ComponentLibrary.tsx')).toBe(false);
    expect(exists('apps/web/src/components/navbar/LiveSearchDropdown.tsx')).toBe(false);
  });

  it('strips commented JSX archive blocks from GuidedTour', () => {
    const tour = read('apps/web/src/components/GuidedTour.tsx');
    expect(tour).not.toContain('COMMENTED COPYS & SIDEBARS');
    expect(tour).not.toContain('POTENTIAL FUTURE COMPONENT REUSE');
  });

  it('routes navbar instant search through SearchModal only', () => {
    const navbar = read('apps/web/src/components/navbar/Navbar.tsx');
    const modal = read('apps/web/src/components/SearchModal.tsx');
    expect(navbar).toContain('onOpenSearchModal');
    expect(modal).toContain('useInstantSearch');
    expect(modal).not.toContain('supabase.from');
  });

  it('replaces facet parity TODO with an explicit deferred note', () => {
    const parity = read('apps/web/src/projection/search-parity.ts');
    expect(parity).not.toMatch(/\bTODO\b/i);
    expect(parity).toContain('facetParity');
  });

  it('removes the stale footer link to the deleted component showroom', () => {
    const footer = read('apps/web/src/components/Footer.tsx');
    expect(footer).not.toContain('component-library');
    expect(footer).not.toContain('Showroom components');
  });
});