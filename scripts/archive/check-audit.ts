import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
dotenv.config();

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

async function check() {
  const { data, error } = await supabaseAdmin
    .from("audit_log")
    .select("entity_type, action")
    .order("created_at", { ascending: false })
    .limit(1);
  if (error) {
    console.error("❌ Error checking audit log:", error);
  } else {
    console.log("✅ Last audit entry:", data);
  }
}
check();
