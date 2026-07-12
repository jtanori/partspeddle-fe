import { supabaseAdmin } from "../../apps/web/src/lib/supabase-admin";

async function test() {
  const { data, error } = await supabaseAdmin
    .from("parts")
    .select("id, title, status, part_images(url), users(id)")
    .eq("status", "AVAILABLE")
    .limit(5);

  if (error) {
    console.error("Parts query error:", error);
  } else {
    console.log("Parts found with joins:", data.length);
    console.log(JSON.stringify(data, null, 2));
  }
}

test();
