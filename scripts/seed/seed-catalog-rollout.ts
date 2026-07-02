import { supabaseAdmin } from '../../src/lib/supabase-admin';

async function seedRolloutCatalog() {
  console.log('🌱 Seeding P1D: 12-Category Catalog Expansion...');

  // 1. Categories (Tier 1 & 2)
  const { data: cats, error: catError } = await supabaseAdmin
    .from('catalog_categories')
    .upsert([
      { slug: 'electrical', name: 'Electrical' },
      { slug: 'alternator', name: 'Alternator' },
      { slug: 'starter', name: 'Starter' },
      { slug: 'fuse-box', name: 'Fuse Box' },
      { slug: 'engine', name: 'Engine' },
      { slug: 'engine-assembly', name: 'Engine Assembly' },
      { slug: 'cylinder-head', name: 'Cylinder Head' },
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
  
  // Set parent relationships
  const parents = [
    { parent: 'electrical', child: 'alternator' },
    { parent: 'electrical', child: 'starter' },
    { parent: 'electrical', child: 'fuse-box' },
    { parent: 'engine', child: 'engine-assembly' },
    { parent: 'engine', child: 'cylinder-head' },
    { parent: 'cooling', child: 'radiator' },
    { parent: 'body', child: 'door' },
    { parent: 'body', child: 'mirror' },
    { parent: 'body', child: 'bumper' },
    { parent: 'suspension', child: 'control-arm' }
  ];

  for (const rel of parents) {
    await supabaseAdmin.from('catalog_categories')
      .update({ parent_id: catMap[rel.parent] })
      .eq('id', catMap[rel.child]);
  }

  // 2. Spec Definitions
  const specs = [
    { key: 'voltage', label: 'Voltage', data_type: 'text', unit: 'V', searchable: true, filterable: true, facetable: true },
    { key: 'amperage', label: 'Amperage', data_type: 'number', unit: 'A', searchable: true, filterable: true, facetable: true },
    { key: 'cylinders', label: 'Cylinder Count', data_type: 'number', searchable: true, filterable: true, facetable: true },
    { key: 'fuel_type', label: 'Fuel Type', data_type: 'enum', searchable: true, filterable: true, facetable: true },
    { key: 'displacement', label: 'Displacement', data_type: 'number', unit: 'L', searchable: true, filterable: true, facetable: true },
    { key: 'side', label: 'Side', data_type: 'enum', searchable: true, filterable: true, facetable: true },
    { key: 'color', label: 'Color', data_type: 'text', searchable: true, filterable: true, facetable: true },
    { key: 'material', label: 'Material', data_type: 'text', searchable: true, filterable: true, facetable: true },
    { key: 'diameter', label: 'Diameter', data_type: 'number', unit: 'in', searchable: true, filterable: true, facetable: true }
  ];

  const { data: specData, error: specError } = await supabaseAdmin
    .from('catalog_spec_definitions')
    .upsert(specs, { onConflict: 'key' }).select();

  if (specError) throw specError;
  const specMap = Object.fromEntries(specData.map(s => [s.key, s.id]));

  // 3. Category Bridges (with Groups)
  await supabaseAdmin.from('catalog_category_specs').delete().neq('category_id', '00000000-0000-0000-0000-000000000000');

  await supabaseAdmin.from('catalog_category_specs').insert([
    { category_id: catMap['alternator'], spec_definition_id: specMap['voltage'], required: true, display_order: 1, group_name: 'Electrical' },
    { category_id: catMap['alternator'], spec_definition_id: specMap['amperage'], required: true, display_order: 2, group_name: 'Electrical' },
    { category_id: catMap['engine-assembly'], spec_definition_id: specMap['cylinders'], required: true, display_order: 1, group_name: 'Mechanical' },
    { category_id: catMap['engine-assembly'], spec_definition_id: specMap['fuel_type'], required: true, display_order: 2, group_name: 'Mechanical' },
    { category_id: catMap['engine-assembly'], spec_definition_id: specMap['displacement'], required: true, display_order: 3, group_name: 'Mechanical' },
    { category_id: catMap['door'], spec_definition_id: specMap['side'], required: true, display_order: 1, group_name: 'Dimensions' },
    { category_id: catMap['door'], spec_definition_id: specMap['color'], required: true, display_order: 2, group_name: 'Dimensions' },
    { category_id: catMap['wheels'], spec_definition_id: specMap['diameter'], required: true, display_order: 1, group_name: 'Dimensions' }
  ]);

  console.log('✅ 12-Category Expansion Seeded.');
}

seedRolloutCatalog().catch(console.error);
