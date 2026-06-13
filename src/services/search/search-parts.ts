import { SearchFilters } from '@/types';
import { supabaseDb } from '@/services/supabase-db';

export const fetchParts = async (filters: SearchFilters, pageParam: number) => {
  return await supabaseDb.searchParts({ ...filters, page: pageParam });
};
