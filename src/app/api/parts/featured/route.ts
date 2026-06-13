import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function GET(req: NextRequest) {
  const started = performance.now();
  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "4", 10);

    const { data, error } = await supabaseAdmin
      .from("parts")
      .select(
        "*, part_images(url), users(id, seller_profiles(id, business_name, rating))",
      )
      .eq("status", "AVAILABLE")
      .order("created_at", { ascending: false })
      .limit(limit);

    console.log(
      `/api/parts/featured query took ${Math.round(performance.now() - started)}ms`,
    );

    if (error) {
      console.error("API Error (/api/parts/featured):", JSON.stringify(error));
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(data);
  } catch (err: any) {
    console.error("API Exception (/api/parts/featured):", err);
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 },
    );
  }
}
