import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import algoliasearch from "https://esm.sh/algoliasearch@4";

const ALGOLIA_APP_ID = Deno.env.get("ALGOLIA_APP_ID") || "";
const ALGOLIA_ADMIN_KEY = Deno.env.get("ALGOLIA_ADMIN_KEY") || "";
const ALGOLIA_INDEX_NAME = "parts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SUPABASE_SERVICE_ROLE_KEY =
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const SUPABASE_WEBHOOK_SECRET = Deno.env.get("SUPABASE_WEBHOOK_SECRET") || "";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  global: { fetch: fetch.bind(globalThis) },
  auth: { persistSession: false },
});

const client = algoliasearch(ALGOLIA_APP_ID, ALGOLIA_ADMIN_KEY);
const index = client.initIndex(ALGOLIA_INDEX_NAME);

function unauthorized(message: string): Response {
  return new Response(JSON.stringify({ error: message }), {
    status: 401,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
  });
}

async function verifyWebhookSignature(req: Request): Promise<boolean> {
  if (!SUPABASE_WEBHOOK_SECRET) {
    console.error("SUPABASE_WEBHOOK_SECRET is not configured");
    return false;
  }

  const signature = req.headers.get("x-webhook-signature");
  if (!signature) return false;

  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(SUPABASE_WEBHOOK_SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );

  const body = await req.clone().text();
  const expected = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(body),
  );
  const expectedHex = Array.from(new Uint8Array(expected))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  if (signature.length !== expectedHex.length) return false;
  let match = 0;
  for (let i = 0; i < signature.length; i++) {
    match |= signature.charCodeAt(i) ^ expectedHex.charCodeAt(i);
  }
  return match === 0;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers":
          "authorization, x-client-info, apikey, content-type, x-webhook-signature",
      },
    });
  }

  const signatureOk = await verifyWebhookSignature(req);
  if (!signatureOk) {
    return unauthorized("Invalid or missing webhook signature");
  }

  try {
    const payload = await req.json();
    const { type, table, record, old_record } = payload;

    if (table !== "parts") {
      return new Response(JSON.stringify({ message: "Table not supported" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (type === "DELETE") {
      await index.deleteObject(old_record.id);
      return new Response(JSON.stringify({ message: "Deleted from Algolia" }), {
        status: 200,
      });
    }

    const { data: part, error } = await supabase
      .from("parts")
      .select(
        `
        id,
        title,
        description,
        price_mxn,
        status,
        condition,
        listing_quality_score,
        created_at,
        part_types!parts_part_type_id_fkey (
          id,
          slug_en,
          name_en,
          categories (
            id,
            slug_en,
            name_en
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
        part_fitment!part_fitment_part_id_fkey (
          vehicle_variant_id,
          vehicle_variants!part_fitment_vehicle_variant_id_fkey (
            id,
            year,
            models!vehicle_variants_model_id_fkey (
              id,
              name,
              makes!models_make_id_fkey (
                id,
                name
              )
            )
          )
        ),
        users!parts_seller_id_fkey (
          id,
          seller_profiles (
            business_name,
            location,
            verification_status,
            seller_trust_score
          )
        ),
        part_images (
          id,
          url,
          is_primary
        )
      `,
      )
      .eq("id", record.id)
      .single();

    if (error || !part) {
      throw new Error(`Error fetching part data: ${error?.message}`);
    }

    const partType = part.part_types;
    const category = partType?.categories;
    const vehicleVariant = part.vehicle_variants;
    const vehicleModel = vehicleVariant?.models;
    const vehicleMake = vehicleModel?.makes;
    const sellerProfile = part.users?.seller_profiles;
    const partImages = part.part_images || [];

    // Compute scores identically to BuildSearchDocumentUseCase
    let sellerTrustScore = 40;
    if (sellerProfile?.verification_status === "verified") sellerTrustScore += 40;
    if (sellerProfile?.whatsapp) sellerTrustScore += 20;

    let listingQualityScore = 0;
    const imageCount = partImages.length;
    if (imageCount > 0) listingQualityScore += 20;
    if (imageCount >= 3) listingQualityScore += 15;

    if (part.description && part.description.length > 100)
      listingQualityScore += 15;
    if (part.description && part.description.length > 300)
      listingQualityScore += 10;

    if (sellerProfile?.verification_status === "verified")
      listingQualityScore += 25;

    const daysOld =
      (Date.now() - new Date(part.created_at).getTime()) /
      (1000 * 60 * 60 * 24);
    if (daysOld < 30) listingQualityScore += 15;

    const fitmentRows = Array.isArray(part.part_fitment)
      ? part.part_fitment
      : part.part_fitment
        ? [part.part_fitment]
        : [];
    const fitmentSignatures = Array.from(
      new Set(
        fitmentRows
          .map((row: any) => {
            const variant = row.vehicle_variants;
            if (!variant) return null;
            const model = Array.isArray(variant.models)
              ? variant.models[0]
              : variant.models;
            const make = Array.isArray(model?.makes)
              ? model.makes[0]
              : model?.makes;
            if (!make?.id || !model?.id || typeof variant.year !== "number") {
              return null;
            }
            return `${make.id}:${model.id}:${variant.year}`;
          })
          .filter((s: string | null): s is string => Boolean(s)),
      ),
    );

    const algoliaRecord = {
      objectID: part.id,
      title: part.title,
      description: part.description,
      price: part.price_mxn,
      status: part.status,
      condition: part.condition || "USED_GOOD",
      created_at: Math.floor(new Date(part.created_at).getTime() / 1000),
      image_url:
        part.part_images?.find((img: any) => img.is_primary)?.url ||
        part.part_images?.[0]?.url ||
        null,

      // Taxonomy
      category: category?.slug_en || "other",
      category_label: category?.name_en || category?.name || "Other",
      part_type: partType?.slug_en || "general",
      part_type_label: partType?.name_en || partType?.name || "General",

      // Fitment
      make: vehicleMake?.name || "Universal",
      model: vehicleModel?.name || "N/A",
      year: vehicleVariant?.year || null,
      fitment_signatures: fitmentSignatures,

      // Seller & Scores
      seller_name: sellerProfile?.business_name || "Particular",
      seller_verified: sellerProfile?.verification_status === "verified",
      seller_trust_score:
        sellerProfile?.seller_trust_score && sellerProfile.seller_trust_score > 0
          ? sellerProfile.seller_trust_score
          : sellerTrustScore,
      listing_quality_score:
        part.listing_quality_score && part.listing_quality_score > 0
          ? part.listing_quality_score
          : listingQualityScore,
      location: sellerProfile?.location || "N/A",
    };

    await index.saveObject(algoliaRecord);

    return new Response(
      JSON.stringify({ message: "Synced to Algolia", objectID: part.id }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      },
    );
  } catch (error: any) {
    console.error("Sync Error:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
