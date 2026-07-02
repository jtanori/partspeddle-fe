import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { requireSeller } from "@/lib/seller-auth";

export async function POST(req: NextRequest) {
  const auth = await requireSeller(req);
  if (auth.error) return auth.error;

  try {
    const payload = await req.json();

    const listing = {
      ...payload.listing,
      seller_id: auth.user.id,
    };

    const { error } = await supabaseAdmin.rpc("commit_inventory_package", {
      listing,
      assets: payload.assets,
      fitment: payload.fitment,
    });

    if (error) {
      console.error("API Error (POST /api/seller/inventory/commit):", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    console.error("API Exception (POST /api/seller/inventory/commit):", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}