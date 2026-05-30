import { supabase } from '../lib/supabase';
import { MOCK_PARTS } from './db';

/**
 * Seeds Make/Model/Year relationships into the normalized schema.
 */
export const seedFitment = async () => {
  console.log('📦 Seeding Normalized Fitment Data...');

  // 1. Extract and map hierarchy
  const makes = new Set<string>();
  const models = new Map<string, string>(); // 'Make|Model' -> MakeID
  const variants = new Set<string>(); // 'ModelID|Year'

  // Helper: Find or Create Make
  const getMake = async (name: string) => {
    let { data } = await supabase.from('makes').select('id').eq('name', name).single();
    if (!data) {
      const { data: newMake } = await supabase.from('makes').insert({ name }).select().single();
      data = newMake;
    }
    return data.id;
  };

  // Helper: Find or Create Model
  const getModel = async (makeId: string, modelName: string) => {
    let { data } = await supabase.from('models').select('id').eq('make_id', makeId).eq('name', modelName).single();
    if (!data) {
      const { data: newModel } = await supabase.from('models').insert({ make_id: makeId, name: modelName }).select().single();
      data = newModel;
    }
    return data.id;
  };

  // Process MOCK_PARTS
  for (const part of MOCK_PARTS) {
    if (!part.compatibility) continue;
    
    for (const c of part.compatibility) {
      const makeId = await getMake(c.make);
      const modelId = await getModel(makeId, c.model);
      
      // Handle year ranges (simplified)
      const years = c.years.split('-').map(Number);
      const startYear = years[0];
      const endYear = years.length > 1 ? years[1] : years[0];

      for (let y = startYear; y <= endYear; y++) {
        await supabase.from('vehicle_variants').upsert({ model_id: modelId, year: y });
      }
    }
  }

  console.log('✅ Normalized Fitment Seeding Complete!');
};
