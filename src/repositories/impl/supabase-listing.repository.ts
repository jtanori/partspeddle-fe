import { SupabaseClient } from '@supabase/supabase-js';
import { ListingRepository } from '../listing.repository';
import { MarketplaceListing } from '@/domain/types/marketplace.types';

export class SupabaseListingRepository implements ListingRepository {
  constructor(private readonly client: Pick<SupabaseClient, 'from'>) {}

  async findById(id: string): Promise<MarketplaceListing | null> {
    const { data, error } = await this.client
      .from('parts')
      .select('*, part_images(url), users(id, seller_profiles(id, business_name, rating))')
      .eq('id', id)
      .eq('status', 'AVAILABLE')
      .single();
    if (error || !data) return null;
    return data as MarketplaceListing;
  }

  async findFeatured(limit: number): Promise<MarketplaceListing[]> {
    const { data, error } = await this.client
      .from('parts')
      .select('*, part_images(url), users(id, seller_profiles(id, business_name, rating))')
      .eq('status', 'AVAILABLE')
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error || !data) return [];
    return data as MarketplaceListing[];
  }
}
