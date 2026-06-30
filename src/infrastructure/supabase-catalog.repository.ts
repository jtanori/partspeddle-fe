import { CatalogRepository } from '../repositories/catalog.repository';
import { CatalogCategory, SpecificationDefinition, CategorySpecification } from '../domain/types/catalog.types';
import { supabaseAdmin } from '../lib/supabase-admin';

export class SupabaseCatalogRepository implements CatalogRepository {
  async getCategory(slug: string): Promise<CatalogCategory | null> {
    const { data, error } = await supabaseAdmin
      .from('catalog_categories')
      .select('*')
      .eq('slug', slug)
      .single();
    return error ? null : data;
  }

  async getCategorySpecificationBundle(categoryId: string) {
    const { data, error } = await supabaseAdmin
      .from('catalog_category_specs')
      .select(`
        *,
        catalog_spec_definitions(*)
      `)
      .eq('category_id', categoryId);
    
    if (error) return null;
    
    return {
      specifications: data,
      definitions: data.map(d => d.catalog_spec_definitions)
    };
  }

  async getDefinition(id: string): Promise<SpecificationDefinition | null> {
    const { data, error } = await supabaseAdmin
      .from('catalog_spec_definitions')
      .select('*')
      .eq('id', id)
      .single();
    return error ? null : data;
  }
}
