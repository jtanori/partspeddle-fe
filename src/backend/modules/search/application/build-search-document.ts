import { supabaseAdmin } from "@/lib/supabase-admin";
import { SearchDocument } from "../domain/search-document";

export class BuildSearchDocumentUseCase {
  async execute(partId: string): Promise<SearchDocument> {
    const { data: part, error: partError } = await supabaseAdmin
      .from("parts")
      .select(
        `
        id,
        title,
        description,
        price_mxn,
        status,
        condition,
        created_at,
        listing_quality_score,
        seller_trust_score,
        part_types!parts_part_type_id_fkey (
          id,
          name:name_es,
          categories (
            id,
            name:name_es
          )
        ),
        vehicle_variants!parts_donor_vehicle_variant_id_fkey (
          id,
          year,
          models (
            id,
            name,
            makes (
              id,
              name
            )
          )
        ),
        users!parts_seller_id_fkey (
          id,
          seller_profiles (
            business_name,
            location,
            verification_status,
            whatsapp
          )
        ),
        part_images (
          id,
          url,
          is_primary
        )
      `,
      )
      .eq("id", partId)
      .single();

    if (partError || !part) {
      throw new Error(`Part not found: ${partId}`);
    }

    const partData = part as any;
    const partType = Array.isArray(partData.part_types)
      ? partData.part_types[0]
      : partData.part_types;
    const category = Array.isArray(partType?.categories)
      ? partType?.categories[0]
      : partType?.categories;
    const vehicleVariant = Array.isArray(partData.vehicle_variants)
      ? partData.vehicle_variants[0]
      : partData.vehicle_variants;
    const vehicleModel = Array.isArray(vehicleVariant?.models)
      ? vehicleVariant.models[0]
      : vehicleVariant?.models;
    const vehicleMake = Array.isArray(vehicleModel?.makes)
      ? vehicleModel.makes[0]
      : vehicleModel?.makes;
    const sellerProfile = Array.isArray(partData.users?.seller_profiles)
      ? partData.users.seller_profiles[0]
      : partData.users?.seller_profiles;

    // --- Scoring Mechanisms ---

    // 1. Seller Trust Score (0-100)
    let sellerTrustScore = 40; // Base score
    if (sellerProfile?.verification_status === "verified")
      sellerTrustScore += 40;
    if (sellerProfile?.whatsapp) sellerTrustScore += 20;

    // 2. Listing Quality Score (0-100)
    let listingQualityScore = 0;
    const imageCount = part.part_images?.length || 0;
    if (imageCount > 0) listingQualityScore += 20;
    if (imageCount >= 3) listingQualityScore += 15;

    if (part.description && part.description.length > 100)
      listingQualityScore += 15;
    if (part.description && part.description.length > 300)
      listingQualityScore += 10;

    if (sellerProfile?.verification_status === "verified")
      listingQualityScore += 25;

    // Recency bonus (last 30 days)
    const daysOld =
      (Date.now() - new Date(part.created_at).getTime()) /
      (1000 * 60 * 60 * 24);
    if (daysOld < 30) listingQualityScore += 15;

    console.log(`[SCGS DEBUG] Part ${part.id} - Quality: ${listingQualityScore}, Trust: ${sellerTrustScore}, Created: ${part.created_at}`);

    return {
      objectID: part.id,
      title: part.title || "",
      description: part.description || "",
      price: part.price_mxn || 0,
      status: part.status || "AVAILABLE",

      // Facetable Attributes
      make: vehicleMake?.name || "Universal",
      model: vehicleModel?.name || "N/A",
      year: vehicleVariant?.year || null,

      category: category?.name || "Otros",
      part_type: partType?.name || "General",

      condition: (part as any).condition || "USED_GOOD",

      seller_name: sellerProfile?.business_name || "Particular",
      seller_verified: sellerProfile?.verification_status === "verified",
      seller_trust_score: partData.seller_trust_score ?? sellerTrustScore,

      location: sellerProfile?.location || "N/A",

      image_url:
        (part.part_images as any)?.find((img: any) => img.is_primary)?.url ||
        (part.part_images as any)?.[0]?.url ||
        null,
      listing_quality_score: partData.listing_quality_score ?? listingQualityScore,
      created_at: Math.floor(new Date(part.created_at).getTime() / 1000),
    };
  }
}
