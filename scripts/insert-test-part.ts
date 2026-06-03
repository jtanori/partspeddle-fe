import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL!, process.env.VITE_SUPABASE_SERVICE_ROLE_KEY!);

async function insertTestPart() {
  const { data, error } = await supabase
    .from('parts')
    .insert([
      { title: 'Test Part Algolia', description: 'Descripción de prueba', price_mxn: 100.00, status: 'available' }
    ]);

  if (error) {
    console.error('Error inserting part:', error);
  } else {
    console.log('Part inserted successfully:', data);
  }
}

insertTestPart();
