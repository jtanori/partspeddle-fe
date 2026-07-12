import { CategoryTemplate, SpecificationValue } from './specification-framework';

/**
 * Port for loading SCGS specification framework data.
 *
 * Implementations bridge the SCGS compiler to whatever persistence layer stores
 * specification definitions, category templates, and listing values.
 */
export interface SpecificationFrameworkRepository {
  getCategoryTemplate(categoryId: string): Promise<CategoryTemplate>;
  getValuesForListing(listingId: string): Promise<SpecificationValue[]>;
}
