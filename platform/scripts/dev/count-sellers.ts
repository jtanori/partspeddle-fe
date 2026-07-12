import { supabaseAdmin } from '../../../apps/web/src/lib/supabase-admin';

async function test() {
  const { data, error } = await supabaseAdmin.from('seller_profiles').select('*');
  if (error) {
    console.error(error);
  } else {
    console.log('Total sellers:', data.length);
    console.log(data);
  }
}

test();
