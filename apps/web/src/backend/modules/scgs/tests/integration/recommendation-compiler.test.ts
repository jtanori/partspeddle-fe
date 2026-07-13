import { describe, it, expect } from 'vitest';
import { compileRecommendations } from '../../infrastructure/recommendation-compiler';
import { makeArtifact } from '../fixtures/artifact';
import type { SearchDocument } from '@/backend/modules/search/domain/search-document';

function makeHit(overrides: Partial<SearchDocument> = {}): SearchDocument {
  return {
    objectID: 'part-2',
    title: 'Compatible Part',
    description: '',
    price: 29.99,
    status: 'active',
    make: 'Honda',
    model: 'Accord',
    year: 2015,
    fitment_signatures: ['honda:accord:2015'],
    category: 'brakes',
    category_label: 'Brakes',
    part_type: 'brake_pads',
    part_type_label: 'Brake Pads',
    condition: 'new',
    seller_name: 'Seller',
    seller_verified: true,
    seller_trust_score: 0.9,
    location: 'US',
    image_url: 'https://example.com/p2.jpg',
    listing_quality_score: 0.8,
    created_at: Date.now(),
    ...overrides,
  };
}

describe('compileRecommendations', () => {
  it('excludes the source listing', () => {
    const source = makeArtifact({ listingId: 'part-1' });
    const candidates = [makeHit({ objectID: 'part-1' }), makeHit({ objectID: 'part-2' })];
    const result = compileRecommendations({ source, candidates, limit: 6 });
    expect(result.map((r) => r.id)).not.toContain('part-1');
    expect(result).toHaveLength(1);
  });

  it('ranks compatibility overlap highest', () => {
    const source = makeArtifact({
      listingId: 'part-1',
      compiled: {
        ...makeArtifact().compiled,
        compatibility: {
          status: 'compatible',
          confidence: 1,
          vehicles: [{ year: 2015, make: 'Honda', model: 'Accord' }],
          notes: [],
          compiledAt: new Date().toISOString(),
        },
      },
    });

    const unrelated = makeHit({
      objectID: 'part-2',
      title: 'Unrelated',
      category: 'electronics',
      part_type: 'sensor',
      make: 'Ford',
      model: 'Focus',
      fitment_signatures: ['ford:focus:2010'],
    });
    const related = makeHit({
      objectID: 'part-3',
      title: 'Related Brake Pads',
      category: 'brakes',
      part_type: 'brake_pads',
      make: 'Honda',
      model: 'Accord',
      fitment_signatures: ['honda:accord:2015'],
    });

    const result = compileRecommendations({ source, candidates: [unrelated, related], limit: 6 });
    expect(result[0].id).toBe('part-3');
    expect(result[0].reasonCodes).toContain('COMPATIBILITY_OVERLAP');
  });

  it('applies same category and part type bonuses', () => {
    const source = makeArtifact({ listingId: 'part-1', categoryId: 'brakes' });
    const sameCategory = makeHit({ objectID: 'part-2', category: 'brakes', part_type: 'rotor' });
    const differentCategory = makeHit({
      objectID: 'part-3',
      category: 'electronics',
      part_type: 'sensor',
    });

    const result = compileRecommendations({
      source,
      candidates: [differentCategory, sameCategory],
      limit: 6,
    });
    expect(result[0].id).toBe('part-2');
    expect(result[0].reasonCodes).toContain('SAME_CATEGORY');
  });

  it('respects the limit', () => {
    const source = makeArtifact({ listingId: 'part-1' });
    const candidates = Array.from({ length: 10 }, (_, i) => makeHit({ objectID: `part-${i + 2}` }));
    const result = compileRecommendations({ source, candidates, limit: 3 });
    expect(result).toHaveLength(3);
  });
});
