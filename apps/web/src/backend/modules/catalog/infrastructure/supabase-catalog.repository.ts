import { SupabaseClient } from '@supabase/supabase-js';
import { CatalogRepository } from '../domain/catalog-repository';
import {
  CatalogCategory,
  CatalogCategorySpecification,
  SpecificationDefinition,
} from '@/domain/types/catalog.types';
import { buildTaxonomy } from '@/lib/taxonomy';

export class SupabaseCatalogRepository implements CatalogRepository {
  constructor(private readonly client: Pick<SupabaseClient, 'from'>) {}

  async getCategory(slug: string): Promise<CatalogCategory | null> {
    const { data, error } = await this.client
      .from('categories')
      .select('*')
      .eq('slug', slug)
      .single();
    if (error || !data) return null;
    return data as CatalogCategory;
  }

  async getSpecificationsForCategory(categoryId: string): Promise<CatalogCategorySpecification[]> {
    const { data, error } = await this.client
      .from('category_specifications')
      .select('*')
      .eq('category_id', categoryId);
    if (error || !data) return [];
    return data as CatalogCategorySpecification[];
  }

  async getDefinition(id: string): Promise<SpecificationDefinition | null> {
    const { data, error } = await this.client
      .from('specification_definitions')
      .select('*')
      .eq('id', id)
      .single();
    if (error || !data) return null;
    return data as SpecificationDefinition;
  }

  async getTaxonomy(): Promise<ReturnType<typeof buildTaxonomy>> {
    const [
      { data: categories, error: categoriesError },
      { data: partTypes, error: partTypesError },
    ] = await Promise.all([
      this.client.from('categories').select('id, slug, slug_en, name, name_en, name_es, icon'),
      this.client
        .from('part_types')
        .select('id, category_id, slug, slug_en, name, name_en, name_es'),
    ]);

    if (categoriesError) throw categoriesError;
    if (partTypesError) throw partTypesError;

    return buildTaxonomy(categories || [], partTypes || []);
  }
}
