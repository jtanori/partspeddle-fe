import { supabaseAdmin } from '../../../apps/web/src/lib/supabase-admin';

async function seedExpansion() {
  console.log('🌱 Seeding P1E: 20-Category Catalog Expansion...');

  // 1. Categories
  const { data: cats, error: catError } = await supabaseAdmin
    .from('catalog_categories')
    .upsert([
      { slug: 'electrical', name: 'Electrical' },
      { slug: 'alternator', name: 'Alternator' },
      { slug: 'starter', name: 'Starter' },
      { slug: 'fuse-box', name: 'Fuse Box' },
      { slug: 'engine', name: 'Engine' },
      { slug: 'engine-assembly', name: 'Engine Assembly' },
      { slug: 'cooling', name: 'Cooling' },
      { slug: 'radiator', name: 'Radiator' },
      { slug: 'body', name: 'Body' },
      { slug: 'door', name: 'Door' },
      { slug: 'mirror', name: 'Mirror' },
      { slug: 'bumper', name: 'Bumper' },
      { slug: 'suspension', name: 'Suspension' },
      { slug: 'control-arm', name: 'Control Arm' },
      { slug: 'wheels', name: 'Wheels' }
    ], { onConflict: 'slug' }).select();

  if (catError) throw catError;
  const catMap = Object.fromEntries(cats.map(c => [c.slug, c.id]));

  // 2. Spec Definitions
  const specs = [
    { key: 'voltage', label: 'Voltage', data_type: 'text', unit: 'V', searchable: true, filterable: true, facetable: true },
    { key: 'amperage', label: 'Amperage', data_type: 'number', unit: 'A', searchable: true, filterable: true, facetable: true },
    { key: 'side', label: 'Side', data_type: 'enum', searchable: true, filterable: true, facetable: true }
  ];
  
  const { data: specData, error: specError } = await supabaseAdmin
    .from('catalog_spec_definitions')
    .upsert(specs, { onConflict: 'key' }).select();

  if (specError) throw specError;
  const specMap = Object.fromEntries(specData.map(s => [s.key, s.id]));

  // 3. Category Bridges
  await supabaseAdmin.from('catalog_category_specs').delete().neq('category_id', '00000000-0000-0000-0000-000000000000');
  await supabaseAdmin.from('catalog_category_specs').insert([
    { category_id: catMap['alternator'], spec_definition_id: specMap['voltage'], required: true, display_order: 1 },
    { category_id: catMap['alternator'], spec_definition_id: specMap['amperage'], required: true, display_order: 2 },
    { category_id: catMap['door'], spec_definition_id: specMap['side'], required: true, display_order: 1 }
  ]);

  // 4. Create Listings for existing parts (Pilot)
  const { data: parts } = await supabaseAdmin.from('parts').select('id, seller_id, price');
  
  for (const part of parts || []) {
     const { data: listing } = await supabaseAdmin
       .from('listings')
       .insert([{ seller_id: part.seller_id, listing_type: 'PART', price: part.price || 0 }])
       .select()
       .single();
     
     if (listing) {
       await supabaseAdmin.from('parts').update({ listing_id: listing.id }).eq('id', part.id);
     }
  }

  console.log('✅ 20-Category Catalog Seeded & Parts Linked.');
}

seedExpansion().catch(console.error);
