import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import * as fs from "fs";
dotenv.config();

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

async function apply() {
  const sql = fs.readFileSync(
    "supabase/migrations/20260603040000_add_unique_constraints.sql",
    "utf8",
  );
  const { error } = await supabaseAdmin.rpc("exec_sql", { sql });
  if (error) console.error("Error:", error);
  else console.log("Constraints applied.");
}
apply();
