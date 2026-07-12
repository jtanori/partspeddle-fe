import { describe, it, expect } from 'vitest';
import { SpecificationCompilerImpl } from '../infrastructure/specification-compiler';
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

function createCompiler() {
  return new SpecificationCompilerImpl(
    {
      findByListingId: async () => [],
      getAllDefinitions: async () => [],
    } satisfies SpecificationRepository,
    {
      getCategory: async () => null,
      getSpecificationsForCategory: async () => [],
      getDefinition: async () => null,
    } satisfies CatalogRepository,
    {
      findById: async () => mockListing,
    } satisfies ListingRepository
  );
}

describe('SCGS lineage', () => {
  it('produces deterministic lineage ids for the same compiled content', async () => {
    const compiler = createCompiler();

    const a = await compiler.compile({ listingId: 'l1', categoryId: 'c1' });

    expect(a.lineageId).toMatch(/^l1:1\.0\.0:[a-f0-9]{64}$/);
    expect(a.checksum).toHaveLength(64);
  });

  it('produces different lineage ids for different listings', async () => {
    const compiler = createCompiler();

    const a = await compiler.compile({ listingId: 'l1', categoryId: 'c1' });
    const b = await compiler.compile({ listingId: 'l2', categoryId: 'c1' });

    expect(a.lineageId).not.toBe(b.lineageId);
  });

  it('embeds listing and version into the lineage id', async () => {
    const compiler = createCompiler();

    const a = await compiler.compile({ listingId: 'l1', categoryId: 'c1', version: '2.0.0' });

    expect(a.lineageId).toMatch(/^l1:2\.0\.0:/);
  });
});
