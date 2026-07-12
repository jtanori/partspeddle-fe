import {
  CatalogCategory,
  SpecificationDefinition,
  CatalogCategorySpecification,
} from '@/domain/types/catalog.types';

export interface CatalogRepository {
  getCategory(slug: string): Promise<CatalogCategory | null>;
  getSpecificationsForCategory(categoryId: string): Promise<CatalogCategorySpecification[]>;
  getDefinition(id: string): Promise<SpecificationDefinition | null>;
}
