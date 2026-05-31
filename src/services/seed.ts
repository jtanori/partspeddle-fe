import { supabase } from '../lib/supabase';
import { MOCK_SELLERS } from './data/sellers';
import { MOCK_PARTS } from './data/parts';

// NOTE: For administrative seeding, ideally use the service_role key.
// To avoid Multiple GoTrueClient instances, we leverage the singleton.
// In production, ensure this singleton is configured with appropriate security context.

export const seedDatabase = async () => {
  console.log('🚀 Starting Database Seeding...');

  try {
    // 1. Seed Seller Profiles
    console.log('📦 Seeding Seller Profiles...');
    for (const s of MOCK_SELLERS) {
      await supabase.from('seller_profiles').upsert({
        business_name: s.name,
      });
    }

    // 2. Seed Parts
    console.log('📦 Seeding Parts...');
    for (const p of MOCK_PARTS) {
      const { data: part } = await supabase.from('parts').upsert({
        title: p.title,
        description: p.description,
        price_mxn: Math.round(p.price * 20),
        status: 'available',
        compatibility: p.compatibility,
        brand: p.title.split(' ')[0],
        model: p.subtitle,
        year: parseInt(p.subtitle.match(/\d{4}/)?.[0] || '0')
      }).select('id').single();

      if (part && p.compatibility) {
        // Seed Fitment for this part
        for (const c of p.compatibility) {
          // Find or Create Make
          let { data: make } = await supabase.from('makes').select('id').eq('name', c.make).single();
          if (!make) {
            const { data: newMake } = await supabase.from('makes').insert({ name: c.make }).select().single();
            make = newMake;
          }

          // Find or Create Model
          let { data: model } = await supabase.from('models').select('id').eq('make_id', make!.id).eq('name', c.model).single();
          if (!model) {
            const { data: newModel } = await supabase.from('models').insert({ make_id: make!.id, name: c.model }).select().single();
            model = newModel;
          }

          // Handle years
          const years = c.years.split('-').map(Number);
          const startYear = years[0];
          const endYear = years.length > 1 ? years[1] : years[0];

          for (let y = startYear; y <= endYear; y++) {
            let { data: variant } = await supabase.from('vehicle_variants').select('id').eq('model_id', model!.id).eq('year', y).single();
            if (!variant) {
                const { data: newVariant } = await supabase.from('vehicle_variants').insert({ model_id: model!.id, year: y }).select().single();
                variant = newVariant;
            }

            // Create Fitment link
            await supabase.from('part_fitment').upsert({
                part_id: part.id,
                vehicle_variant_id: variant!.id
            });
          }
        }
      }
    }

    console.log('✅ Seeding Complete!');
    return { success: true };
  } catch (error) {
    console.error('❌ Seeding Failed:', error);
    return { success: false, error };
  }
};
