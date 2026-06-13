import { supabaseAdmin } from "../src/lib/supabase-admin";
import "dotenv/config";

async function cleanAllParts() {
  console.log(
    "🧹 Cleaning ALL inventory data (Parts and cascaded dependencies)...",
  );
  try {
    // Delete all parts. Cascading constraints will automatically remove part_images and part_fitment.
    // We use a filter that matches all UUIDs (not null) to ensure all records are deleted.
    const { error } = await supabaseAdmin
      .from("parts")
      .delete()
      .not("id", "is", null);

    if (error) throw error;
    console.log("✅ All inventory data cleanup successful.");
  } catch (error) {
    console.error("❌ Error during cleanup:", error);
  }
}
cleanAllParts();
