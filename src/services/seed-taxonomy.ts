import { supabase } from '../lib/supabase';
import { CATEGORIES, SYSTEMS_TAXONOMY } from './db';

export const seedTaxonomy = async () => {
  console.log('📦 Seeding Categories & Part Types...');

  for (const [sysKey, sysData] of Object.entries(SYSTEMS_TAXONOMY)) {
    // 1. Insert Category
    const { data: category, error: catError } = await supabase
      .from('categories')
      .upsert({ 
        name: sysData.name, 
        slug: sysKey.toLowerCase().replace(/ /g, '-'),
        icon: 'Cog' 
      })
      .select()
      .single();

    if (catError) {
      console.error(`Error seeding category ${sysKey}:`, catError);
      continue;
    }

    // 2. Insert Part Types
    const partTypesToInsert = Object.keys(sysData.assemblies).map(assemblyName => ({
      category_id: category.id,
      name: assemblyName,
      slug: assemblyName.toLowerCase().replace(/ /g, '-')
    }));

    const { error: ptError } = await supabase.from('part_types').upsert(partTypesToInsert);
    if (ptError) console.error(`Error seeding part types for ${sysKey}:`, ptError);
  }

  console.log('✅ Taxonomy Seeding Complete!');
};
