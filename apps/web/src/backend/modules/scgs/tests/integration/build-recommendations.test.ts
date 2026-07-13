import { describe, it, expect, vi } from 'vitest';
import { buildRecommendations } from '../../application/build-recommendations';
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

describe('buildRecommendations', () => {
  it('queries the search repository and returns scored recommendations', async () => {
    const source = makeArtifact({ listingId: 'part-1', categoryId: 'brakes' });
    const repo = {
      search: vi.fn().mockResolvedValue({
        hits: [
          makeHit({ objectID: 'part-2', title: 'Brake Rotor' }),
          makeHit({ objectID: 'part-3', title: 'Brake Fluid', part_type: 'brake_fluid' }),
        ],
      }),
    };

    const result = await buildRecommendations(
      { source, excludeIds: ['part-1'], limit: 6 },
      { searchRepository: repo as any },
    );

    expect(repo.search).toHaveBeenCalledWith(
      '',
      expect.objectContaining({ categoryIds: ['brakes'] }),
      0,
      100,
    );
    expect(result).toHaveLength(2);
    expect(result[0].score).toBeGreaterThan(0);
  });

  it('excludes specified ids', async () => {
    const source = makeArtifact({ listingId: 'part-1' });
    const repo = {
      search: vi.fn().mockResolvedValue({
        hits: [makeHit({ objectID: 'part-2' }), makeHit({ objectID: 'part-3' })],
      }),
    };

    const result = await buildRecommendations(
      { source, excludeIds: ['part-2'], limit: 6 },
      { searchRepository: repo as any },
    );
    expect(result.map((r) => r.id)).not.toContain('part-2');
  });
});
