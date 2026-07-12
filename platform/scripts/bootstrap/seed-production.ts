import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import * as path from "path";
import { faker } from "@faker-js/faker";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const SUPABASE_URL = process.env.SUPABASE_URL || "";
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error(
    "❌ Error: Variables de entorno de Supabase (SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY) faltantes.",
  );
  process.exit(1);
}

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

async function main() {
  const args = process.argv.slice(2);
  const count = parseInt(args[0]) || 20;
  console.log(`🚀 Sembrando ${count} partes con datos realistas y scores...`);

  try {
    const { data: sellers } = await supabaseAdmin
      .from("seller_profiles")
      .select("user_id, verification_status");
    if (!sellers || sellers.length === 0) throw new Error("No sellers found");

    const { data: variants } = await supabaseAdmin.from("vehicle_variants")
      .select(`
      id, 
      year, 
      models (
        name, 
        makes (name)
      )
    `);
    if (!variants || variants.length === 0)
      throw new Error("No vehicle variants found");

    const { data: partTypes } = await supabaseAdmin
      .from("part_types")
      .select("id, name");
    if (!partTypes || partTypes.length === 0)
      throw new Error("No part types found");

    for (let i = 0; i < count; i++) {
      const seller = faker.helpers.arrayElement(sellers);
      const variant = faker.helpers.arrayElement(variants);
      const partType = faker.helpers.arrayElement(partTypes);

      const modelName = (variant.models as any)?.name || "Unknown Model";
      const makeName = (variant.models as any)?.makes?.name || "Unknown Make";
      const year = variant.year;
      const ptName = partType.name;
      const brand = faker.company.name();

      const title = `${ptName} para ${makeName} ${modelName} ${year}`;
      const description = `${faker.commerce.productDescription()} Este ${ptName.toLowerCase()} es un componente original retirado de un ${makeName} ${modelName} año ${year}. Se encuentra en condiciones de uso y ha sido verificado. Marca: ${brand}. ${faker.lorem.paragraph()}`;

      // Calculate Score (matching BuildSearchDocument logic)
      let qualityScore = 0;
      qualityScore += 35; // We will add images below
      if (description.length > 200) qualityScore += 25;
      if (seller.verification_status === "verified") qualityScore += 25;
      qualityScore += 15; // Recency bonus

      const { data: part, error: partError } = await supabaseAdmin
        .from("parts")
        .insert({
          seller_id: seller.user_id,
          status: "AVAILABLE",
          title: title,
          description: description,
          price_mxn: faker.number.int({ min: 800, max: 25000 }),
          part_type_id: partType.id,
          donor_vehicle_variant_id: variant.id,
          condition: faker.helpers.arrayElement([
            "USED_EXCELLENT",
            "USED_GOOD",
            "USED_FAIR",
          ]),
          listing_quality_score: qualityScore,
          searchable_text:
            `${title} ${description} ${brand} ${makeName} ${modelName} ${year} ${ptName}`.toLowerCase(),
        })
        .select()
        .single();

      if (partError) throw partError;

      // Add 1-3 placeholder images
      const images = [];
      const imageCount = faker.number.int({ min: 1, max: 3 });
      for (let j = 0; j < imageCount; j++) {
        images.push({
          part_id: part.id,
          url: `https://picsum.photos/seed/${part.id}-${j}/800/600`,
          is_primary: j === 0,
        });
      }
      await supabaseAdmin.from("part_images").insert(images);
    }

    console.log(
      `✅ ${count} partes sembradas exitosamente con scores e imágenes.`,
    );
  } catch (error) {
    console.error("💥 Error durante el seed:", error);
  }
}

main();
