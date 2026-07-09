import { SupabaseClient } from '@supabase/supabase-js';

export interface SellerProfile {
  id: string;
  business_name: string | null;
  location: string | null;
  whatsapp: string | null;
  verification_status: string | null;
  created_at: string;
  users?: { avatar_url: string | null } | null;
}

export class SupabaseSellerRepository {
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
