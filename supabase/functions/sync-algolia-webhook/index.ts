import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7"
import { algoliasearch } from "https://esm.sh/algoliasearch@5.0.0"

const ALGOLIA_APP_ID = Deno.env.get('VITE_ALGOLIA_APP_ID') || '';
const ALGOLIA_ADMIN_API_KEY = Deno.env.get('VITE_ALGOLIA_ADMIN_API_KEY') || '';
const ALGOLIA_INDEX_NAME = 'parts';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || '';
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
const algoliaClient = algoliasearch(ALGOLIA_APP_ID, ALGOLIA_ADMIN_API_KEY);

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
    const payload = await req.json();
    const { type, table, record, old_record } = payload;

    if (table !== 'parts') {
      return new Response(JSON.stringify({ message: "Table not supported" }), { status: 400 });
    }

    if (type === 'DELETE') {
      await algoliaClient.deleteObject({
        indexName: ALGOLIA_INDEX_NAME,
        objectID: old_record.id,
      });
      return new Response(JSON.stringify({ message: "Deleted from Algolia" }), { status: 200 });
    }

    // For INSERT or UPDATE, we fetch the complete record with relations
    const { data: part, error } = await supabase
      .from('parts')
      .select(`
        *,
        part_types (
          id,
          name_es,
          name_en,
          slug_es,
          slug_en,
          categories (
            id,
            name_es,
            name_en,
            slug_es,
            slug_en
          )
        ),
        vehicle_variants (
          id,
          name,
          year_start,
          year_end,
          vehicle_models (
            id,
            name,
            vehicle_brands (
              id,
              name
            )
          )
        ),
        seller_profiles (
          id,
          business_name,
          city,
          state
        ),
        part_images (
          id,
          image_url,
          is_primary
        )
      `)
      .eq('id', record.id)
      .single();

    if (error || !part) {
      throw new Error(`Error fetching part data: ${error?.message}`);
    }

    // Map to Algolia record
    const algoliaRecord = {
      objectID: part.id,
      title: part.title,
      description: part.description,
      price: part.price,
      condition: part.condition,
      status: part.status,
      oem_part_number: part.oem_part_number,
      sku: part.sku,
      category: {
        id: part.part_types?.categories?.id,
        name: part.part_types?.categories?.name_es, // Defaulting to Spanish as per context
        name_en: part.part_types?.categories?.name_en,
      },
      part_type: {
        id: part.part_types?.id,
        name: part.part_types?.name_es,
        name_en: part.part_types?.name_en,
      },
      vehicle: {
        variant_id: part.vehicle_variants?.id,
        variant_name: part.vehicle_variants?.name,
        model_name: part.vehicle_variants?.vehicle_models?.name,
        brand_name: part.vehicle_variants?.vehicle_models?.vehicle_brands?.name,
        years: {
          start: part.vehicle_variants?.year_start,
          end: part.vehicle_variants?.year_end
        }
      },
      seller: {
        id: part.seller_profiles?.id,
        name: part.seller_profiles?.business_name,
        location: `${part.seller_profiles?.city}, ${part.seller_profiles?.state}`
      },
      images: part.part_images?.map((img: any) => ({
        url: img.image_url,
        is_primary: img.is_primary
      })) || [],
      primary_image: part.part_images?.find((img: any) => img.is_primary)?.image_url || part.part_images?.[0]?.image_url,
      created_at: part.created_at,
      _geoloc: part.seller_profiles?.latitude ? {
        lat: part.seller_profiles.latitude,
        lng: part.seller_profiles.longitude
      } : null
    };

    await algoliaClient.saveObject({
      indexName: ALGOLIA_INDEX_NAME,
      body: algoliaRecord,
    });

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
