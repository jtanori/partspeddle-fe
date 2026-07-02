import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { requireSeller } from "@/lib/seller-auth";

export async function POST(req: NextRequest) {
  const auth = await requireSeller(req);
  if (auth.error) return auth.error;

  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof Blob)) {
      return NextResponse.json({ error: "Missing file upload." }, { status: 400 });
    }

    const fileName = `${auth.user.id}/${crypto.randomUUID()}.jpg`;

    const { error: uploadError } = await supabaseAdmin.storage
      .from("yard-assets")
      .upload(fileName, file, { contentType: file.type || "image/jpeg" });

    if (uploadError) {
      console.error("API Error (POST /api/seller/assets/upload):", uploadError);
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    const { data: publicUrlData } = supabaseAdmin.storage
      .from("yard-assets")
      .getPublicUrl(fileName);

    return NextResponse.json({
      fileName,
      publicUrl: publicUrlData.publicUrl,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    console.error("API Exception (POST /api/seller/assets/upload):", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}