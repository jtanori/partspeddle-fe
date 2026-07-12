import { supabaseAdmin } from "../../../apps/web/src/lib/supabase-admin";

async function debugPart() {
  const { data, error } = await supabaseAdmin
    .from("parts")
    .select("*")
    .eq("status", "AVAILABLE")
    .limit(1);

  if (error) {
    console.error("Parts query error:", error);
  } else {
    console.log("Sample part row:", JSON.stringify(data[0], null, 2));
  }
}

debugPart();
