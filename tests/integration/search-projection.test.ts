import { describe, it, expect } from 'vitest';
import { projectToSearchDocument } from '../../src/mappers/search-projection.engine';
import { MarketplaceListing } from '../../src/domain/marketplace.types';
import { SpecificationDefinition } from '../../src/domain/types/catalog.types';

describe('SearchProjectionEngine Integration', () => {
  it('projects only governed fields and maintains determinism', () => {
    const listing: MarketplaceListing = {
      id: 'l1',
      listingType: 'PART',
      sellerId: 's1',
      categoryId: 'alternator',
      title: 'Alternator',
      description: 'Test Desc',
      createdAt: '2026-06-14T00:00:00Z',
      inventory: { condition: 'Used', availabilityStatus: 'available' },
      pricing: { askingPrice: 100, currency: 'USD' },
      specifications: [
        { key: 'voltage', label: 'Voltage', value: '12V', group: 'Electrical', displayOrder: 1 },
        { key: 'internal_notes', label: 'Notes', value: 'Private', group: 'Admin', displayOrder: 99 }
      ]
    };

    const definitions: SpecificationDefinition[] = [
      { id: 'def_v', key: 'voltage', label: 'Voltage', data_type: 'text', searchable: true, filterable: true, facetable: true, is_active: true, validation_rules: {} },
      { id: 'def_n', key: 'internal_notes', label: 'Notes', data_type: 'text', searchable: false, filterable: false, facetable: false, is_active: true, validation_rules: {} }
    ];

    const searchDoc = projectToSearchDocument(listing, definitions);

    // Assert: Voltage projected
    expect(searchDoc.facets.voltage).toBe('12V');
    // Assert: Internal notes NOT projected (governance)
    expect(searchDoc.facets.internal_notes).toBeUndefined();
    // Assert: Determinism
    expect(searchDoc.updatedAt).toBe(listing.createdAt);
  });
});
