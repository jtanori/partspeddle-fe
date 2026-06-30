import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
dotenv.config();

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

async function check() {
  const { data } = await supabaseAdmin
    .from("part_types")
    .select("name_es, name_en")
    .limit(5);
  console.log(data);
}
check();
