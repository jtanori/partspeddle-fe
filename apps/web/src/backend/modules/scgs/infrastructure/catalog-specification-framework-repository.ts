import { CatalogRepository } from '@/repositories/catalog.repository';
import { SpecificationRepository } from '@/repositories/specification.repository';
import { SpecificationFrameworkRepository } from '../domain/specification-framework-repository';
import { CategoryTemplate, SpecificationValue } from '../domain/specification-framework';
import { mapCategoryTemplate, mapSpecificationValues } from './specification-framework-mapper';

/**
 * Adapter that implements the SCGS specification framework repository port
 * using the existing catalog and specification repositories.
 *
 * This keeps SCGS decoupled from the underlying persistence schema while
 * reusing the current data access layer.
 */
export class CatalogSpecificationFrameworkRepository implements SpecificationFrameworkRepository {
  constructor(
    private readonly catalogRepo: CatalogRepository,
    private readonly specRepo: SpecificationRepository,
  ) {}

  async getCategoryTemplate(categoryId: string): Promise<CategoryTemplate> {
    const [definitions, categorySpecs] = await Promise.all([
      this.specRepo.getAllDefinitions(),
      this.catalogRepo.getSpecificationsForCategory(categoryId),
    ]);

    return mapCategoryTemplate(categoryId, definitions, categorySpecs);
  }

  async getValuesForListing(listingId: string): Promise<SpecificationValue[]> {
    const [definitions, listingSpecs] = await Promise.all([
      this.specRepo.getAllDefinitions(),
      this.specRepo.findByListingId(listingId),
    ]);

    return mapSpecificationValues(definitions, listingSpecs);
  }
}
