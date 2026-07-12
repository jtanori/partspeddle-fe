import { SupabaseClient } from '@supabase/supabase-js';
import { SellerProfile } from '../domain/seller-profile';
import { SellerRepository } from '../domain/seller-repository';

export class SupabaseSellerRepository implements SellerRepository {
  constructor(private readonly client: Pick<SupabaseClient, 'from'>) {}

  async findTopSellers(limit: number): Promise<SellerProfile[]> {
    const { data, error } = await this.client
      .from('seller_profiles')
      .select(
        'id, business_name, location, whatsapp, verification_status, created_at, users(avatar_url)',
      )
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error || !data) return [];
    return data as SellerProfile[];
  }
}
