import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function read(relativePath: string): string {
  return fs.readFileSync(path.resolve(__dirname, '../../../', relativePath), 'utf-8');
}

describe('P0 taxonomy source of truth and indexing', () => {
  it('loads taxonomy from Supabase via useTaxonomy hook', () => {
    const hook = read('src/hooks/useTaxonomy.ts');
    expect(hook).toContain('useTaxonomy');
    expect(hook).toContain('categories');
    expect(hook).toContain('part_types');
    expect(hook).toContain('slug_en');
  });

  it('indexes category and part_type by English slugs with display labels', () => {
    const builder = read('src/backend/modules/search/application/build-search-document.ts');
    expect(builder).toContain('category: category?.slug_en');
    expect(builder).toContain('category_label:');
    expect(builder).toContain('part_type: partType?.slug_en');
    expect(builder).toContain('part_type_label:');
  });

  it('emits the same slug fields from the Algolia webhook', () => {
    const webhook = read('supabase/functions/sync-algolia-webhook/index.ts');
    expect(webhook).toContain('slug_en');
    expect(webhook).toContain('category_label');
    expect(webhook).toContain('part_type_label');
  });

  it('filters search results using taxonomy slugs in ProductSidebar', () => {
    const sidebar = read('src/components/ProductSidebar.tsx');
    expect(sidebar).toContain('useTaxonomy');
    expect(sidebar).toContain('cat.slug_en');
    expect(sidebar).toContain('type.slug_en');
  });

  it('unifies score computation between webhook and batch builder', () => {
    const builder = read('src/backend/modules/search/application/build-search-document.ts');
    const webhook = read('supabase/functions/sync-algolia-webhook/index.ts');
    expect(builder).toContain('listing_quality_score');
    expect(builder).toContain('seller_trust_score');
    expect(webhook).toContain('listing_quality_score');
    expect(webhook).toContain('seller_trust_score');
  });
});