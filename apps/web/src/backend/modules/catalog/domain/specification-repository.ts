import { ListingSpecification } from '@/domain/types/marketplace.types';
import { SpecificationDefinition } from '@/domain/types/catalog.types';

export interface SpecificationRepository {
  findByListingId(listingId: string): Promise<ListingSpecification[]>;
  getAllDefinitions(): Promise<SpecificationDefinition[]>;
}
