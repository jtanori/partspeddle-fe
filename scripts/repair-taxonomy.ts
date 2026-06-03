import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || '';
const SUPABASE_SERVICE_ROLE_KEY = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || '';

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false }
});

async function main() {
  console.log('🧹 Reparando Taxonomía Bilingüe...');

  const TAXONOMY = [
    { es: 'Sistema Eléctrico', en: 'Electrical System', types: [{ es: 'Alternador', en: 'Alternator' }, { es: 'Módulo de Encendido', en: 'Ignition Module' }] },
    { es: 'Tren Motriz', en: 'Powertrain', types: [{ es: 'Múltiple de Admisión', en: 'Intake Manifold' }, { es: 'Carburador', en: 'Carburador' }, { es: 'Transmisión Automática', en: 'Automatic Transmission' }] }
  ];

  const partTypeMap: Record<string, string> = {};

  for (const group of TAXONOMY) {
    const { data: catData } = await supabaseAdmin
      .from('categories')
      .update({
        name_es: group.es,
        name_en: group.en,
        slug_es: toSlug(group.es),
        slug_en: toSlug(group.en)
      })
      .eq('name', group.es)
      .select('id')
      .single();

    if (!catData) continue;

    for (const t of group.types) {
      const { data: typeData } = await supabaseAdmin
        .from('part_types')
        .update({
          name_es: t.es,
          name_en: t.en,
          slug_es: toSlug(t.es),
          slug_en: toSlug(t.en)
        })
        .eq('name', t.es)
        .eq('category_id', catData.id)
        .select('id')
        .single();
        
      if (typeData) partTypeMap[t.es] = typeData.id;
    }
  }
  
  console.log('✅ Taxonomía bilingüe actualizada.');
  console.log('Mapping:', partTypeMap);
}

function toSlug(text: string) {
  return text.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
}

main();
