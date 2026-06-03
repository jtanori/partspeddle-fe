import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL!, process.env.VITE_SUPABASE_SERVICE_ROLE_KEY!);

async function checkTable() {
  const { data, error } = await supabase
    .from('parts')
    .select('*')
    .limit(1);

  if (error) {
    console.error('Error checking table:', error);
  } else {
    console.log('Table structure sample:', Object.keys(data[0] || {}));
  }
}

checkTable();
