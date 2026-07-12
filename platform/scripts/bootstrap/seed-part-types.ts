import { supabaseAdmin } from '../../../apps/web/src/lib/supabase-admin';

const CATEGORY_DATA = [
  {
    name: 'Engine',
    slug: 'engine',
    name_es: 'Motor',
    name_en: 'Engine',
    slug_es: 'motor',
    slug_en: 'engine',
  },
  {
    name: 'Electrical',
    slug: 'electrical',
    name_es: 'Eléctrico',
    name_en: 'Electrical',
    slug_es: 'electrico',
    slug_en: 'electrical',
  },
  {
    name: 'Body',
    slug: 'body',
    name_es: 'Carrocería',
    name_en: 'Body',
    slug_es: 'carroceria',
    slug_en: 'body',
  },
  {
    name: 'Suspension',
    slug: 'suspension',
    name_es: 'Suspensión',
    name_en: 'Suspension',
    slug_es: 'suspension',
    slug_en: 'suspension',
  },
  {
    name: 'Wheels',
    slug: 'wheels',
    name_es: 'Rines',
    name_en: 'Wheels',
    slug_es: 'rines',
    slug_en: 'wheels',
  },
];

const PART_TYPES_BY_CATEGORY: Record<string, string[]> = {
  Engine: ['Engine Assembly', 'Cylinder Head', 'Radiator'],
  Electrical: ['Alternator', 'Starter', 'Fuse Box'],
  Body: ['Door', 'Mirror', 'Bumper'],
  Suspension: ['Control Arm', 'Strut', 'Shock Absorber'],
  Wheels: ['Wheel', 'Hubcap', 'Tire'],
};

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

async function seedPartTypes() {
  console.log('🌱 Seeding categories and part types...');

  for (const category of CATEGORY_DATA) {
    const { data: cat, error: catError } = await supabaseAdmin
      .from('categories')
      .upsert(category, { onConflict: 'slug' })
      .select()
      .single();

    if (catError || !cat) {
      console.error(`❌ Failed to seed category ${category.name}:`, catError?.message);
      continue;
    }

    const partTypeNames = PART_TYPES_BY_CATEGORY[category.name] || [];
    for (const partTypeName of partTypeNames) {
      const slug = slugify(partTypeName);
      const { error: ptError } = await supabaseAdmin.from('part_types').upsert(
        {
          category_id: cat.id,
          name: partTypeName,
          slug,
          name_es: partTypeName,
          name_en: partTypeName,
          slug_es: slug,
          slug_en: slug,
        },
        { onConflict: 'category_id,name' },
      );

      if (ptError) {
        console.error(`❌ Failed to seed part type ${partTypeName}:`, ptError.message);
      }
    }
  }

  console.log('✅ Categories and part types seeded.');
}

seedPartTypes().catch((err) => {
  console.error('💥 Critical failure seeding part types:', err);
  process.exit(1);
});
