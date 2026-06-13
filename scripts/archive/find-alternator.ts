import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

async function getPartIds() {
  const { data: parts } = await supabaseAdmin
    .from("parts")
    .select("id, title")
    .ilike("title", "%Alternador%")
    .limit(1);
  console.log(JSON.stringify(parts, null, 2));
}
getPartIds();
