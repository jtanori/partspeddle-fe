import { supabaseAdmin } from '../../../apps/web/src/lib/supabase-admin.ts';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

async function backfillSeller() {
  const sellerId = 'd3b07384-d113-4a61-9c60-038234dbfa88';
  
  try {
    console.log(`🔄 Backfilling seller_id: ${sellerId} for parts with null seller_id...`);
    
    const { data, error } = await supabaseAdmin
      .from('parts')
      .update({ seller_id: sellerId })
      .is('seller_id', null)
      .select();
      
    if (error) throw error;
    console.log(`✅ Actualizadas ${data.length} partes.`);

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

backfillSeller();
