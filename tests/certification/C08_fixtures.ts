import { CompiledSpecificationSet } from '../src/domain/services/specification.compiler';

export const createFixture = (listingId: string, categoryId: string, overrides: Partial<CompiledSpecificationSet> = {}): CompiledSpecificationSet => ({
  flat: [],
  grouped: [
    {
      name: 'General',
      order: 1,
      items: [
        { key: 'make', label: 'Make', value: 'Toyota', group: 'General', groupOrder: 1, displayOrder: 1, isSearchable: true, isFacetable: true }
      ]
    }
  ],
  facets: { make: 'Toyota' },
  ...overrides
});
