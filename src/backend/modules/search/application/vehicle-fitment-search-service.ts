import { supabaseAdmin } from '@/lib/supabase-admin';

export interface VehicleQuery {
  makeId?: string;
  modelId?: string;
  year?: number;
  engineId?: string;
}

export class VehicleFitmentSearchService {
  async getCompatiblePartIds(query: VehicleQuery): Promise<string[]> {
    let q = supabaseAdmin
      .from('part_fitment')
      .select('part_id, vehicle_variants!inner(id, year, vehicle_models!inner(id, vehicle_makes!inner(id)))');

    if (query.makeId) {
      q = q.eq('vehicle_variants.vehicle_models.vehicle_makes.id', query.makeId);
    }
    if (query.modelId) {
      q = q.eq('vehicle_variants.vehicle_models.id', query.modelId);
    }
    if (query.year) {
      q = q.eq('vehicle_variants.year', query.year);
    }

    const { data, error } = await q;

    if (error || !data) {
      return [];
    }

    return Array.from(new Set(data.map((f: any) => f.part_id)));
  }
}
