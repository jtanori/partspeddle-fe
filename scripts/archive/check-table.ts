
import { supabaseAdmin } from '../apps/web/src/lib/supabase-admin';

async function test() {
  const { data, error } = await supabaseAdmin.from('seller_profiles').select('*').limit(1);
  if (error) {
    console.error(error);
  } else {
    console.log(Object.keys(data[0]));
  }
}

test();
