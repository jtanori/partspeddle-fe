import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { requireSeller } from "@/lib/seller-auth";

export async function GET(req: NextRequest) {
  const auth = await requireSeller(req);
  if (auth.error) return auth.error;

  try {
    const { data, error } = await supabaseAdmin
      .from("seller_profiles")
      .select("*")
      .eq("user_id", auth.user.id)
      .single();

    if (error) {
      console.error("API Error (GET /api/seller/profile):", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    console.error("API Exception (GET /api/seller/profile):", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireSeller(req);
    if (auth.error) return auth.error;

    const { yardName, whatsappNumber, location, email } = await req.json();

    const sanitizedName =
      yardName?.replace(/<\/?[^>]+(>|$)/g, "") || "Unnamed Yard";

    const { error: userError } = await supabaseAdmin
      .from("users")
      .update({ email, full_name: sanitizedName })
      .eq("id", auth.user.id);

    if (userError) throw userError;

    const { data, error: sellerError } = await supabaseAdmin
      .from("seller_profiles")
      .update({
        business_name: sanitizedName,
        location,
        whatsapp: whatsappNumber,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", auth.user.id)
      .select("*")
      .single();

    if (sellerError) throw sellerError;

    return NextResponse.json({
      success: true,
      profile: {
        id: data.id,
        name: data.business_name,
        location: data.location,
        whatsapp: data.whatsapp,
        email,
        status: data.verification_status,
      },
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Internal server error";
    console.error("API Exception (POST /api/seller/profile):", message);
    return NextResponse.json(
      { error: "Internal server synchronization error." },
      { status: 500 },
    );
  }
}