import { supabaseAdmin } from '@/lib/supabase-admin';
import { PartsRepository } from '../domain/parts.repository';
import { Part } from '@/types';

export class SupabasePartsRepository implements PartsRepository {
  async getPartById(id: string): Promise<Part | null> {
    const { data, error } = await supabaseAdmin
      .from('parts')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      console.error('Error fetching part by ID:', error);
      return null;
    }
    
    return data as Part | null;
  }

  async getSellerByUserId(userId: string): Promise<any | null> {
    const { data, error } = await supabaseAdmin
      .from('seller_profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching seller by ID:', error);
      return null;
    }

    return data;
  }
}
