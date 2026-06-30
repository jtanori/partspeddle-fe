import { SpecificationRepository } from '../repositories/specification.repository';
import { ListingSpecification } from '../domain/marketplace.types';
import { supabaseAdmin } from '../lib/supabase-admin';

export class SupabaseSpecificationRepository implements SpecificationRepository {
  async findByListingId(listingId: string): Promise<ListingSpecification[]> {
    const { data, error } = await supabaseAdmin
      .from('listing_specifications')
      .select(`
        value_text, value_number, value_boolean,
        catalog_spec_definitions(key, label, unit)
      `)
      .eq('listing_id', listingId);

    if (error || !data) return [];

    return data.map((s: any) => ({
      key: s.catalog_spec_definitions.key,
      label: s.catalog_spec_definitions.label,
      value: s.value_number ?? s.value_text ?? s.value_boolean ?? '',
      unit: s.catalog_spec_definitions.unit
    }));
  }
}
