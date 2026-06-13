import { createClient } from "@supabase/supabase-js";
import { algoliasearch } from "algoliasearch";
import * as dotenv from "dotenv";
import * as path from "path";

// Forzar la carga de .env desde la raíz del proyecto
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

const algoliaClient = algoliasearch(
  process.env.ALGOLIA_APP_ID!,
  process.env.ALGOLIA_ADMIN_KEY!,
);

async function syncSupabaseToAlgolia() {
  console.log(
    "🔄 Iniciando extracción de Supabase para indexación en Algolia...",
  );

  try {
    // 1. Consultar partes activas
    const { data: parts, error } = await supabase
      .from("parts")
      .select(
        `
        id,
        title,
        description,
        price_mxn,
        status,
        created_at,
        part_types (
          name_es,
          categories (name_es)
        ),
        vehicle_variants!parts_donor_vehicle_variant_id_fkey (
          year,
          models (
            name,
            makes (name)
          )
        ),
        users (
          seller_profiles (
            business_name,
            location
          )
        ),
        part_images (
          url,
          is_primary
        )
      `,
      )
      .eq("status", "AVAILABLE");

    if (error) throw error;

    if (!parts || parts.length === 0) {
      console.log(
        '⚠️ No se encontraron partes "available" listos para sincronizar.',
      );
      return;
    }

    console.log(`📦 Procesando y transformando ${parts.length} partes...`);

    // 2. Mapear al payload denormalizado de Algolia (Flattened)
    const algoliaRecords = parts.map((part: any) => {
      const primaryImage =
        part.part_images?.find((img: any) => img.is_primary)?.url ||
        part.part_images?.[0]?.url ||
        null;

      return {
        objectID: part.id,
        title: part.title,
        description: part.description,
        price: part.price_mxn,
        status: part.status,
        created_at: Math.floor(new Date(part.created_at).getTime() / 1000),
        image_url: primaryImage,

        // Flattened Taxonomy
        category: part.part_types?.categories?.name_es || "Otros",
        part_type: part.part_types?.name_es || "General",

        // Flattened Fitment
        make: part.vehicle_variants?.models?.makes?.name || "Universal",
        model: part.vehicle_variants?.models?.name || "N/A",
        year: part.vehicle_variants?.year || null,

        // Flattened Seller info (Safe navigation)
        seller_name: part.users?.seller_profiles?.business_name || "Particular",
        location: part.users?.seller_profiles?.location || "N/A",
        // placeholder for missing fields until schema updated
        condition: part.condition || "Used",
        seller_verified: false,
      };
    });

    // 3. Guardar masivamente en Algolia
    console.log("📤 Subiendo registros a Algolia...");
    const response = await algoliaClient.saveObjects({
      indexName: "parts", // Consolidate to 'parts' index
      objects: algoliaRecords,
    });
    console.log("✅ Subida completada", response);

    // Note: Assuming response structure changed in new Algolia SDK
    console.log(`🎉 Sincronización exitosa.`);
  } catch (error) {
    console.error("❌ Error crítico en el pipeline de sincronización:", error);
  }
}

syncSupabaseToAlgolia();
