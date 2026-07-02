import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { buildTaxonomy } from "@/lib/taxonomy";

export async function GET() {
  try {
    const [
      { data: categories, error: categoriesError },
      { data: partTypes, error: partTypesError },
    ] = await Promise.all([
      supabaseAdmin
        .from("categories")
        .select("id, slug, slug_en, name, name_en, name_es, icon"),
      supabaseAdmin
        .from("part_types")
        .select("id, category_id, slug, slug_en, name, name_en, name_es"),
    ]);

    if (categoriesError) throw categoriesError;
    if (partTypesError) throw partTypesError;

    return NextResponse.json(
      buildTaxonomy(categories || [], partTypes || []),
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    console.error("API Exception (/api/taxonomy):", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}