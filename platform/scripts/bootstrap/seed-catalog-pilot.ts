import { supabaseAdmin } from '../../../apps/web/src/lib/supabase-admin';

async function seedPilotCatalog() {
  console.log('🌱 Seeding P1B: Four Category Pilot Framework...');

  // 1. Categories
  const { data: cats, error: catError } = await supabaseAdmin
    .from('catalog_categories')
    .upsert([
      { slug: 'electrical', name: 'Electrical' },
      { slug: 'alternator', name: 'Alternator' },
      { slug: 'engine', name: 'Engine' },
      { slug: 'body', name: 'Body' },
      { slug: 'door', name: 'Door' },
      { slug: 'wheels', name: 'Wheels' }
    ], { onConflict: 'slug' }).select();

  if (catError) throw catError;
  const catMap = Object.fromEntries(cats.map(c => [c.slug, c.id]));
  
  // Set parent relationships
  await supabaseAdmin.from('catalog_categories').update({ parent_id: catMap['electrical'] }).eq('id', catMap['alternator']);
  await supabaseAdmin.from('catalog_categories').update({ parent_id: catMap['body'] }).eq('id', catMap['door']);

  // 2. Spec Definitions
  const { data: specs, error: specError } = await supabaseAdmin
    .from('catalog_spec_definitions')
    .upsert([
      { key: 'voltage', label: 'Voltage', data_type: 'text', unit: 'V', searchable: true, filterable: true, facetable: true },
      { key: 'amperage', label: 'Amperage', data_type: 'number', unit: 'A', searchable: true, filterable: true, facetable: true },
      { key: 'cylinders', label: 'Cylinder Count', data_type: 'number', searchable: true, filterable: true, facetable: true },
      { key: 'fuel_type', label: 'Fuel Type', data_type: 'enum', searchable: true, filterable: true, facetable: true },
      { key: 'side', label: 'Side', data_type: 'enum', searchable: true, filterable: true, facetable: true },
      { key: 'diameter', label: 'Diameter', data_type: 'number', unit: 'in', searchable: true, filterable: true, facetable: true },
      { key: 'bolt_pattern', label: 'Bolt Pattern', data_type: 'text', searchable: true, filterable: true, facetable: true },
      { key: 'rotation', label: 'Rotation', data_type: 'enum', searchable: false, filterable: true, facetable: false }
    ], { onConflict: 'key' }).select();

  if (specError) throw specError;
  const specMap = Object.fromEntries(specs.map(s => [s.key, s.id]));

  // 3. Category Bridges (with Groups)
  // Delete existing bridges first for clean slate
  await supabaseAdmin.from('catalog_category_specs').delete().neq('category_id', '00000000-0000-0000-0000-000000000000');

  const { error: bridgeError } = await supabaseAdmin
    .from('catalog_category_specs')
    .insert([
      { category_id: catMap['alternator'], spec_definition_id: specMap['voltage'], required: true, display_order: 1, group_name: 'Electrical' },
      { category_id: catMap['alternator'], spec_definition_id: specMap['amperage'], required: true, display_order: 2, group_name: 'Electrical' },
      { category_id: catMap['alternator'], spec_definition_id: specMap['rotation'], required: false, display_order: 1, group_name: 'Mechanical' },
      
      { category_id: catMap['engine'], spec_definition_id: specMap['cylinders'], required: true, display_order: 1, group_name: 'Mechanical' },
      { category_id: catMap['engine'], spec_definition_id: specMap['fuel_type'], required: true, display_order: 2, group_name: 'Mechanical' },
      
      { category_id: catMap['door'], spec_definition_id: specMap['side'], required: true, display_order: 1, group_name: 'Dimensions' },
      
      { category_id: catMap['wheels'], spec_definition_id: specMap['diameter'], required: true, display_order: 1, group_name: 'Dimensions' },
      { category_id: catMap['wheels'], spec_definition_id: specMap['bolt_pattern'], required: true, display_order: 2, group_name: 'Dimensions' }
    ]);

  if (bridgeError) throw bridgeError;

  // 4. Enum Options
  // Delete existing for clean slate
  await supabaseAdmin.from('catalog_spec_options').delete().neq('spec_definition_id', '00000000-0000-0000-0000-000000000000');

  const fuelTypeSpec = specMap['fuel_type'];
  await supabaseAdmin.from('catalog_spec_options').insert([
    { spec_definition_id: fuelTypeSpec, value: 'gasoline', label: 'Gasoline', display_order: 1 },
    { spec_definition_id: fuelTypeSpec, value: 'diesel', label: 'Diesel', display_order: 2 },
    { spec_definition_id: specMap['side'], value: 'driver', label: 'Driver Side', display_order: 1 },
    { spec_definition_id: specMap['side'], value: 'passenger', label: 'Passenger Side', display_order: 2 },
    { spec_definition_id: specMap['rotation'], value: 'cw', label: 'Clockwise', display_order: 1 },
    { spec_definition_id: specMap['rotation'], value: 'ccw', label: 'Counter-Clockwise', display_order: 2 }
  ]);

  console.log('✅ Pilot Catalog Seeded.');
}

seedPilotCatalog().catch(console.error);
