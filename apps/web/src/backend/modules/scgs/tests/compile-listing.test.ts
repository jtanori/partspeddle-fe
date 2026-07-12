import { describe, it, expect } from 'vitest';
import { compileListing } from '../application/compile-listing';
import { SpecificationRepository } from '@/repositories/specification.repository';
import { CatalogRepository } from '@/backend/modules/catalog/domain/catalog-repository';
import { ListingRepository } from '@/backend/modules/listing/domain/listing-repository';
import { MarketplaceListing } from '@/domain/types/marketplace.types';

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
  specifications: [],
  listingQualityScore: 0.8,
  sellerTrustScore: 0.7,
};

function createMockDeps() {
  return {
    specRepo: {
      findByListingId: async () => [],
      getAllDefinitions: async () => [],
    } satisfies SpecificationRepository,
    catalogRepo: {
      getCategory: async () => null,
      getSpecificationsForCategory: async () => [],
      getDefinition: async () => null,
    } satisfies CatalogRepository,
    listingRepo: {
      findById: async () => mockListing,
    } satisfies ListingRepository,
  };
}

describe('SCGS compileListing use case', () => {
  it('returns a lineage-aware artifact', async () => {
    const artifact = await compileListing(
      { listingId: 'l1', categoryId: 'c1', version: '1.0.0' },
      createMockDeps()
    );

    expect(artifact.listingId).toBe('l1');
    expect(artifact.categoryId).toBe('c1');
    expect(artifact.version).toBe('1.0.0');
    expect(artifact.lineageId).toMatch(/^l1:1\.0\.0:/);
    expect(artifact.checksum).toHaveLength(64);
    expect(artifact.compiled.rankingFactors.listingQuality).toBe(0.8);
  });

  it('uses a default version when omitted', async () => {
    const artifact = await compileListing(
      { listingId: 'l1', categoryId: 'c1' },
      createMockDeps()
    );

    expect(artifact.version).toBe('1.0.0');
    expect(artifact.lineageId).toMatch(/^l1:1\.0\.0:/);
  });
});
