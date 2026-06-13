import { supabaseAdmin } from '../src/lib/supabase-admin.ts';
import 'dotenv/config';

async function listTriggers() {
  try {
    // Attempting to query pg_trigger, which usually requires higher privileges.
    // PostgREST/Supabase often restricts direct access to pg_* tables.
    // If this fails, we will know the system configuration is highly restricted.
    const { data, error } = await supabaseAdmin
      .from('pg_trigger' as any)
      .select('tgname, tgrelid');
      
    if (error) {
      console.log('❌ Error querying pg_trigger:', error.message);
    } else {
      console.log('📋 Triggers:', data);
    }

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

listTriggers();
