import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { requireSeller } from "@/lib/seller-auth";

export async function GET(req: NextRequest) {
  const auth = await requireSeller(req);
  if (auth.error) return auth.error;

  try {
    const { searchParams } = new URL(req.url);
    const filter = searchParams.get("filter");

    let query = supabaseAdmin
      .from("parts")
      .select(
        "id, title, price_mxn, stock_number, images, status, views, offers(count)",
      )
      .eq("seller_id", auth.user.id);

    if (filter) {
      query = query.eq("status", filter);
    }

    const { data, error } = await query;

    if (error) {
      console.error("API Error (GET /api/seller/inventory):", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data || []);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    console.error("API Exception (GET /api/seller/inventory):", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}