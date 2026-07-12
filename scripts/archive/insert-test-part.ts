import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

async function insertTestPart() {
  const { data, error } = await supabase.from("parts").insert([
    {
      title: "Test Part Algolia",
      description: "Descripción de prueba",
      price_mxn: 100.0,
      status: "AVAILABLE",
      donor_vehicle_variant_id: "d81a867d-2018-499c-a20a-72a0588f7320",
    },
  ]);

  if (error) {
    console.error("Error inserting part:", error);
  } else {
    console.log("Part inserted successfully:", data);
  }
}

insertTestPart();
