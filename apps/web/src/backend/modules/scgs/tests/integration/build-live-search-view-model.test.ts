import { describe, it, expect, vi } from 'vitest';
import { buildLiveSearchViewModel } from '../../application/build-live-search-view-model';
import type { SearchDocument } from '@/backend/modules/search/domain/search-document';

function makeHit(overrides: Partial<SearchDocument> = {}): SearchDocument {
  return {
    objectID: 'part-1',
    title: 'Brake Pads',
    description: 'Ceramic brake pads',
    price: 49.99,
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
    seller_name: 'Test Seller',
    seller_verified: true,
    seller_trust_score: 0.9,
    location: 'US',
    image_url: 'https://example.com/image.jpg',
    listing_quality_score: 0.8,
    created_at: Date.now(),
    ...overrides,
  };
}

describe('buildLiveSearchViewModel', () => {
  it('returns empty groups for short queries', async () => {
    const repo = { search: vi.fn().mockResolvedValue({ hits: [] }) };
    const vm = await buildLiveSearchViewModel({ query: 'a' }, { searchRepository: repo as any });
    expect(vm.groups).toHaveLength(0);
    expect(vm.intent.type).toBe('PART_NAME');
  });

  it('groups Algolia hits into products, vehicles, taxonomy, and manufacturers', async () => {
    const repo = {
      search: vi.fn().mockResolvedValue({
        hits: [
          makeHit({
            objectID: 'part-1',
            title: 'Front Brake Pads',
            category: 'brakes',
            make: 'Honda',
            model: 'Accord',
            year: 2015,
          }),
          makeHit({
            objectID: 'part-2',
            title: 'Rotor',
            category: 'brakes',
            make: 'Toyota',
            model: 'Camry',
            year: 2018,
          }),
        ],
      }),
    };

    const vm = await buildLiveSearchViewModel(
      { query: 'brake pads', hitsPerPage: 10 },
      { searchRepository: repo as any },
    );

    expect(vm.intent.type).toBe('PART_NAME');
    expect(vm.groups.some((g) => g.key === 'products')).toBe(true);
    expect(vm.groups.some((g) => g.key === 'vehicles')).toBe(true);
    expect(vm.groups.some((g) => g.key === 'taxonomy')).toBe(true);
    expect(vm.groups.some((g) => g.key === 'manufacturers')).toBe(true);

    const products = vm.groups.find((g) => g.key === 'products')?.suggestions ?? [];
    expect(products).toHaveLength(2);
  });

  it('detects YMM intent', async () => {
    const repo = { search: vi.fn().mockResolvedValue({ hits: [] }) };
    const vm = await buildLiveSearchViewModel(
      { query: '2015 Honda Accord' },
      { searchRepository: repo as any },
    );
    expect(vm.intent.type).toBe('YMM');
    expect(vm.intent.entities.vehicle?.year).toBe(2015);
  });
});
