import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import algoliasearch from "https://esm.sh/algoliasearch@4";

const ALGOLIA_APP_ID = Deno.env.get('ALGOLIA_APP_ID') || '';
const ALGOLIA_ADMIN_KEY = Deno.env.get('ALGOLIA_ADMIN_KEY') || '';
const ALGOLIA_INDEX_NAME = 'parts';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || '';
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  global: { fetch: fetch.bind(globalThis) },
  auth: { persistSession: false }
});

// Algolia v4 client initialization
const client = algoliasearch(ALGOLIA_APP_ID, ALGOLIA_ADMIN_KEY);
const index = client.initIndex(ALGOLIA_INDEX_NAME);

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { 
      headers: { 
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
      } 
    })
  }

  try {
    const bodyText = await req.text();
    console.log("Raw payload:", bodyText);
    const payload = JSON.parse(bodyText);
    const { type, table, record, old_record } = payload;
    console.log("Parsed payload:", { type, table });

    if (table !== 'parts') {
      return new Response(JSON.stringify({ message: "Table not supported" }), { status: 400 });
    }

    if (type === 'DELETE') {
      await index.deleteObject(old_record.id);
      return new Response(JSON.stringify({ message: "Deleted from Algolia" }), { status: 200 });
    }

    const { data: part, error } = await supabase
      .from('parts')
      .select(`
        id,
        title,
        description,
        price_mxn,
        status,
        created_at,
        part_types!parts_part_type_id_fkey (
          id,
          name_es,
          name_en,
          categories (
            id,
            name_es,
            name_en
          )
        ),
        vehicle_variants!parts_donor_vehicle_variant_id_fkey (
          id,
          year,
          models (
            id,
            name,
            makes (
              id,
              name
            )
          )
        ),
        users!parts_seller_id_fkey (
          id,
          seller_profiles (
            business_name,
            location,
            whatsapp
          )
        ),
        part_images (
          id,
          url,
          is_primary
        )
      `)
      .eq('id', record.id)
      .single();

    if (error || !part) {
      throw new Error(`Error fetching part data: ${error?.message}`);
    }

    const partType = part.part_types;
    const category = partType?.categories;
    const vehicleVariant = part.vehicle_variants;
    const vehicleModel = vehicleVariant?.models;
    const vehicleMake = vehicleModel?.makes;
    const sellerProfile = part.users?.seller_profiles;

    const algoliaRecord = {
      objectID: part.id,
      title: part.title,
      description: part.description,
      price: part.price_mxn,
      status: part.status,
      category: {
        id: category?.id,
        name: category?.name_es || 'Otros',
        name_en: category?.name_en || 'Others',
      },
      part_type: {
        id: partType?.id,
        name: partType?.name_es,
        name_en: partType?.name_en,
      },
      vehicle: {
        variant_id: vehicleVariant?.id,
        year: vehicleVariant?.year,
        model_name: vehicleModel?.name,
        brand_name: vehicleMake?.name,
      },
      seller: {
        id: part.users?.id,
        business_name: sellerProfile?.business_name || 'Particular',
        location: sellerProfile?.location || 'N/A',
        whatsapp: sellerProfile?.whatsapp || null
      },
      images: part.part_images?.map((img: any) => ({
        url: img.url,
        is_primary: img.is_primary
      })) || [],
      primary_image: part.part_images?.find((img: any) => img.is_primary)?.url || part.part_images?.[0]?.url || null,
      created_at: part.created_at
    };

    await index.saveObject(algoliaRecord);

    return new Response(JSON.stringify({ message: "Synced to Algolia", objectID: part.id }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    console.error("Sync Error:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
})
