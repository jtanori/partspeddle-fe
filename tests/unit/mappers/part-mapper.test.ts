import { describe, it, expect, vi } from 'vitest';
import { mapPartToViewModel } from '../../../src/mappers/part.mapper';
import { PartListing } from '../../../src/domain/marketplace.types';
import { SpecificationCompiler } from '../../../src/domain/services/specification.compiler';

describe('PartMapper', () => {
  it('correctly maps and groups specifications dynamically', async () => {
    const listing: PartListing = {
      id: 'l1',
      listingType: 'PART',
      sellerId: 's1',
      categoryId: 'cat_alternator',
      title: 'Alternator',
      description: 'Desc',
      createdAt: '2026-06-14',
      inventory: { condition: 'Used', availabilityStatus: 'available' },
      pricing: { askingPrice: 100, currency: 'USD' },
      specifications: [
        { key: 'voltage', value: '12V' },
        { key: 'amperage', value: 120 }
      ],
      partNumber: 'A1'
    };

    const mockCompiler: SpecificationCompiler = {
      compile: vi.fn().mockResolvedValue({
        flat: [],
        grouped: [
          {
            name: 'Electrical',
            order: 1,
            items: [
              { key: 'voltage', label: 'Voltage', value: '12V', group: 'Electrical', groupOrder: 1, displayOrder: 1, isSearchable: true, isFacetable: true },
              { key: 'amperage', label: 'Amperage', value: 120, group: 'Electrical', groupOrder: 1, displayOrder: 2, isSearchable: true, isFacetable: true }
            ]
          }
        ],
        facets: {}
      })
    };

    const viewModel = await mapPartToViewModel(listing, mockCompiler);

    expect(viewModel.specifications).toHaveLength(1);
    expect(viewModel.specifications[0].name).toBe('Electrical');
    expect(viewModel.specifications[0].specifications).toHaveLength(2);
    expect(viewModel.specifications[0].specifications[0].label).toBe('Voltage');
  });
});
