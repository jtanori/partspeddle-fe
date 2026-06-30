import { CatalogCategory, SpecificationDefinition, CategorySpecification } from '../domain/types/catalog.types';

export interface CatalogRepository {
  getCategory(slug: string): Promise<CatalogCategory | null>;
  getSpecificationsForCategory(categoryId: string): Promise<CategorySpecification[]>;
  getDefinition(id: string): Promise<SpecificationDefinition | null>;
}
