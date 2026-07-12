import { describe, it, expect } from 'vitest';
import { SpecificationCompilerImpl } from '../../infrastructure/specification-compiler';
import { CatalogSpecificationFrameworkRepository } from '../../infrastructure/catalog-specification-framework-repository';
import { SpecificationRepository } from '@/repositories/specification.repository';
import { CatalogRepository } from '@/backend/modules/catalog/domain/catalog-repository';
import { ListingRepository } from '@/backend/modules/listing/domain/listing-repository';
import { MarketplaceListing } from '@/domain/types/marketplace.types';
import { SpecificationDefinition as CatalogDefinition } from '@/domain/types/catalog.types';

const definitions: CatalogDefinition[] = [
  {
    id: 'def-voltage',
    key: 'voltage',
    label: 'Voltage',
    data_type: 'number',
    unit: 'V',
    searchable: true,
    filterable: false,
    facetable: false,
    is_active: true,
    validation_rules: {},
  },
  {
    id: 'def-material',
    key: 'material',
    label: 'Material',
    data_type: 'text',
    searchable: true,
    filterable: false,
    facetable: true,
    is_active: true,
    validation_rules: {},
  },
];

const mockListing: MarketplaceListing = {
  id: 'l1',
  listingType: 'PART',
  sellerId: 's1',
  categoryId: 'c1',
  title: 'Test Part',
  description: 'Test',
  createdAt: new Date().toISOString(),
  inventory: { condition: 'USED_GOOD', quantity: 1, availabilityStatus: 'available' },
  pricing: { askingPrice: 100, currency: 'USD' },
  specifications: [
    { key: 'voltage', label: 'Voltage', value: 14.5 },
    { key: 'material', label: 'Material', value: 'Ceramic' },
  ],
  listingQualityScore: 0.8,
  sellerTrustScore: 0.7,
};

function createCompiler() {
  const specRepo = {
    findByListingId: async () => mockListing.specifications,
    getAllDefinitions: async () => definitions,
  } satisfies SpecificationRepository;

  const catalogRepo = {
    getCategory: async () => null,
    getSpecificationsForCategory: async () => [
      {
        category_id: 'c1',
        spec_definition_id: 'def-voltage',
        required: true,
        display_order: 0,
        group_name: 'Electrical',
      },
      {
        category_id: 'c1',
        spec_definition_id: 'def-material',
        required: false,
        display_order: 1,
        group_name: 'Physical',
      },
    ],
    getDefinition: async () => null,
  } satisfies CatalogRepository;

  const listingRepo = {
    findById: async () => mockListing,
  } satisfies ListingRepository;

  const frameworkRepo = new CatalogSpecificationFrameworkRepository(catalogRepo, specRepo);
  return new SpecificationCompilerImpl(frameworkRepo, listingRepo);
}

describe('SCGS SpecificationCompiler with framework types', () => {
  it('compiles listing specs into grouped resolved specs', async () => {
    const compiler = createCompiler();
    const artifact = await compiler.compile({ listingId: 'l1', categoryId: 'c1' });

    expect(artifact.compiled.flat).toHaveLength(2);
    expect(artifact.compiled.grouped).toHaveLength(2);
    expect(artifact.compiled.grouped[0].name).toBe('Electrical');
    expect(artifact.compiled.grouped[1].name).toBe('Physical');
  });

  it('extracts facets from facetable definitions', async () => {
    const compiler = createCompiler();
    const artifact = await compiler.compile({ listingId: 'l1', categoryId: 'c1' });

    expect(artifact.compiled.facets.material).toBe('Ceramic');
    expect(artifact.compiled.facets.voltage).toBeUndefined();
  });

  it('preserves trust, compatibility, and fitment conclusions', async () => {
    const compiler = createCompiler();
    const artifact = await compiler.compile({
      listingId: 'l1',
      categoryId: 'c1',
      compatibility: {
        entries: [{ make: 'Honda', model: 'Civic', years: '2020', engine: '2.0L' }],
      },
    });

    expect(artifact.compiled.trust.score).toBeGreaterThan(0);
    expect(artifact.compiled.compatibility.status).toBe('compatible');
    expect(artifact.compiled.fitment.fitmentScore).toBeGreaterThan(0);
  });
});
