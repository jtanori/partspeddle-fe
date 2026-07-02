import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function read(relativePath: string): string {
  return fs.readFileSync(path.resolve(__dirname, '../../../', relativePath), 'utf-8');
}

function fileExists(relativePath: string): boolean {
  return fs.existsSync(path.resolve(__dirname, '../../../', relativePath));
}

describe('P2.1 UI/UX standardization', () => {
  it('removes the duplicate FeaturedParts homepage component', () => {
    expect(fileExists('src/components/homepage/FeaturedParts.tsx')).toBe(false);
    const homepage = read('src/components/Homepage.tsx');
    expect(homepage).toContain('ListingsGrid');
    expect(homepage).not.toContain("from './homepage/FeaturedParts'");
    expect(homepage).not.toContain('from "./homepage/FeaturedParts"');
  });

  it('adds a debounced instant-search hook backed by the search API', () => {
    const hook = read('src/hooks/useInstantSearch.ts');
    expect(hook).toContain('useInstantSearch');
    expect(hook).toContain('/api/search/parts');
    expect(hook).toContain('AbortController');
  });

  it('routes navbar and modal instant search through the shared hook', () => {
    const dropdown = read('src/components/navbar/LiveSearchDropdown.tsx');
    const modal = read('src/components/SearchModal.tsx');
    expect(dropdown).toContain('useInstantSearch');
    expect(modal).toContain('useInstantSearch');
    expect(dropdown).not.toContain('supabaseDb');
    expect(modal).not.toContain('supabase.from');
  });

  it('uses shared condition color utilities in search projection and cards', () => {
    const projection = read('src/projection/search.ts');
    const partCard = read('src/components/shared/PartCard.tsx');
    expect(projection).toContain('getConditionColor');
    expect(projection).not.toContain("conditionColor: 'bg-zinc-100'");
    expect(partCard).toContain('getConditionColor');
  });

  it('uses next/image and a static placeholder asset for grid cards', () => {
    const gridCard = read('src/components/search/cards/ProductGridCard.tsx');
    const partImages = read('src/lib/part-images.ts');
    const nextConfig = read('next.config.ts');
    expect(gridCard).toContain('next/image');
    expect(gridCard).toContain('DEFAULT_PART_IMAGE');
    expect(partImages).toContain('default_listing.png');
    expect(nextConfig).toContain('remotePatterns');
  });

  it('computes seller badges from real listing data instead of hardcoded true flags', () => {
    const projection = read('src/projection/search.ts');
    expect(projection).toContain('seller_verified');
    expect(projection).toContain('listing_quality_score');
    expect(projection).not.toContain('isTested: true');
    expect(projection).not.toContain('isGoodFit: true');
  });
});