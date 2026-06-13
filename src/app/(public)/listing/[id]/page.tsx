import React from "react";
import { supabaseAdmin } from "@/lib/supabase-admin";
import ProductDetailClient from "@/components/ProductDetailClient";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ListingDetailPage({ params }: Props) {
  const { id } = await params;

  // Server-side fetch
  const { data: part, error } = await supabaseAdmin
    .from("parts")
    .select("*, seller_profiles(*)")
    .eq("id", id)
    .single();

  if (error || !part) {
    return <div>Part not found</div>;
  }

  return (
    <div className="bg-base-cream min-h-screen">
      <ProductDetailClient initialPart={part} />
    </div>
  );
}
