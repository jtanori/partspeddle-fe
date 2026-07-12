import { supabaseAdmin } from '../../apps/web/src/lib/supabase-admin';

async function verifySchema() {
  console.log('🔍 Verifying Schema for Runtime Framework...');
  
  // Verify table renaming
  const { error } = await supabaseAdmin
    .from('listing_specifications')
    .select('count', { head: true, count: 'exact' });
    
  if (error) {
    console.error('❌ Table listing_specifications not found or inaccessible');
  } else {
    console.log('✅ listing_specifications exists');
  }
  
  // Verify new columns
  const { error: colError } = await supabaseAdmin
    .from('catalog_categories')
    .select('search_template, wizard_template, pdp_template')
    .limit(1);

  if (colError) {
    console.error('❌ Category template metadata columns missing');
  } else {
    console.log('✅ Category template columns verified');
  }
}

verifySchema().catch(console.error);
