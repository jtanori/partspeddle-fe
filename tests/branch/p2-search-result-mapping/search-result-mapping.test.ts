import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildSearchProjection, buildSearchResultCard } from '@/projection/search';
import { mapAlgoliaHitToPart } from '@/lib/search/map-search-hit';
import { mapAlgoliaFacetsToViewModels } from '@/lib/search/map-search-facets';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function read(relativePath: string): string {
  return fs.readFileSync(path.resolve(__dirname, '../../../', relativePath), 'utf-8');
}

describe('P2.4 search result mapping and display', () => {
  it('maps Algolia hits to display labels while preserving taxonomy slugs', () => {
    const part = mapAlgoliaHitToPart({
      objectID: 'part-1',
      title: 'Alternator',
      category: 'electrical',
      category_label: 'Electrical System',
      part_type: 'alternator',
      part_type_label: 'Alternator',
      price: 1200,
      condition: 'USED_GOOD',
      make: 'Honda',
      model: 'Civic',
      year: 2015,
    });

    expect(part.category).toBe('Electrical System');
    expect(part.partType).toBe('Alternator');
    expect(part.categorySlug).toBe('electrical');
    expect(part.partTypeSlug).toBe('alternator');
    expect(part.subtitle).toContain('2015');
  });

  it('builds search cards with display labels and computed badges', () => {
    const card = buildSearchResultCard({
      objectID: 'part-1',
      title: 'Alternator',
      category: 'electrical',
      category_label: 'Electrical System',
      part_type: 'alternator',
      part_type_label: 'Alternator',
      price: 1200,
      condition: 'NEW',
      seller_verified: true,
      listing_quality_score: 80,
      fitment_signatures: ['make-1:model-1:2015'],
      make: 'Honda',
      model: 'Civic',
      year: 2015,
      seller_name: 'Yard A',
      seller_trust_score: 80,
    });

    expect(card.subtitle).toContain('2015');
    expect(card.facets.categoryLabel).toBe('Electrical System');
    expect(card.facets.partTypeLabel).toBe('Alternator');
    expect(card.facets.categorySlug).toBe('electrical');
    expect(card.badges.isOEM).toBe(true);
    expect(card.badges.isTested).toBe(true);
    expect(card.badges.isGoodFit).toBe(true);
    expect(card.sellerName).toBe('Yard A');
  });

  it('populates facet view models for the search projection', () => {
    const projection = buildSearchProjection(
      [{
        objectID: 'part-1',
        title: 'Alternator',
        category: 'electrical',
        category_label: 'Electrical System',
        part_type: 'alternator',
        part_type_label: 'Alternator',
        price: 1200,
        condition: 'USED_GOOD',
      }],
      0,
      20,
      1,
      {
        category: { electrical: 3 },
        make: { Honda: 2 },
      },
      {
        query: '',
        system: '',
        category: 'electrical',
        partTypes: [],
        fitmentMake: 'All Makes',
        fitmentModel: 'All Models',
        fitmentYear: 'All Years',
        fitmentEngine: 'All Engines',
        featured: false,
        priceRange: [0, 10000],
        conditions: [],
        sellerType: 'all',
      },
    );

    expect(projection.results).toHaveLength(1);
    expect(projection.facets).toHaveLength(2);
    expect(projection.facets[0].values[0].selected).toBe(true);
  });

  it('maps supabase-db hits using display labels instead of raw slugs', () => {
    const mapper = read('src/services/supabase-db.ts');
    expect(mapper).toContain('category_label || row.category');
    expect(mapper).toContain('part_type_label || row.part_type');
  });

  it('requests Algolia facet counts and display fields in the repository', () => {
    const repository = read('src/backend/modules/search/infrastructure/algolia-search-repository.ts');
    expect(repository).toContain('category_label');
    expect(repository).toContain('part_type_label');
    expect(repository).toContain('facets:');
    expect(repository).toContain('"seller_verified"');
  });
});