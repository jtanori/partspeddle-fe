import { supabaseAdmin } from '@/lib/supabase-admin';
import { SearchDocument } from '../domain/search-document';

interface CategoryRow {
  id: string;
  slug_en: string;
  name_en: string;
}

interface PartTypeRow {
  id: string;
  slug_en: string;
  name_en: string;
  categories: CategoryRow | CategoryRow[] | null;
}

interface MakeRow {
  id: string;
  name: string;
}

interface ModelRow {
  id: string;
  name: string;
  makes: MakeRow | MakeRow[] | null;
}

interface VehicleVariantRow {
  id: string;
  year: number;
  models: ModelRow | ModelRow[] | null;
}

interface PartImageRow {
  id: string;
  url: string;
  is_primary: boolean | null;
}

interface SellerProfileRow {
  business_name: string | null;
  location: string | null;
  verification_status: string | null;
  whatsapp: string | null;
  seller_trust_score: number | null;
}

interface UserRow {
  id: string;
  seller_profiles: SellerProfileRow | SellerProfileRow[] | null;
}

interface FitmentRow {
  vehicle_variant_id: string;
  vehicle_variants: VehicleVariantRow | VehicleVariantRow[] | null;
}

interface PartRow {
  id: string;
  title: string | null;
  description: string | null;
  price_mxn: number | null;
  status: string | null;
  condition: string | null;
  created_at: string;
  listing_quality_score: number | null;
  part_types: PartTypeRow | PartTypeRow[] | null;
  vehicle_variants: VehicleVariantRow | VehicleVariantRow[] | null;
  part_fitment: FitmentRow[] | null;
  users: UserRow | UserRow[] | null;
  part_images: PartImageRow[] | null;
}

function single<T>(value: T | T[] | null | undefined): T | null | undefined {
  if (Array.isArray(value)) {
    return value[0];
  }
  return value ?? null;
}

export class BuildSearchDocumentUseCase {
  async execute(partId: string): Promise<SearchDocument> {
    const { data: part, error: partError } = await supabaseAdmin
      .from('parts')
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
            whatsapp,
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
      .eq('id', partId)
      .single();

    if (partError || !part) {
      throw new Error(`Part not found: ${partId}`);
    }

    const partData = part as PartRow;
    const partType = single(partData.part_types);
    const category = single(partType?.categories);
    const vehicleVariant = single(partData.vehicle_variants);
    const vehicleModel = single(vehicleVariant?.models);
    const vehicleMake = single(vehicleModel?.makes);
    const sellerUser = single(partData.users);
    const sellerProfile = single(sellerUser?.seller_profiles);

    // Fitment signatures for exact tuple filtering in Algolia.
    const fitmentRows = partData.part_fitment ?? [];
    const fitmentSignatures: string[] = Array.from(
      new Set(
        fitmentRows
          .map((row) => {
            const variant = single(row.vehicle_variants);
            if (!variant) return null;
            const model = single(variant.models);
            const make = single(model?.makes);
            if (!make?.id || !model?.id || typeof variant.year !== 'number') {
              return null;
            }
            return `${make.id}:${model.id}:${variant.year}`;
          })
          .filter((s): s is string => typeof s === 'string'),
      ),
    );

    // --- Scoring Mechanisms ---

    // 1. Seller Trust Score (0-100)
    let sellerTrustScore = 40; // Base score
    if (sellerProfile?.verification_status === 'verified') sellerTrustScore += 40;
    if (sellerProfile?.whatsapp) sellerTrustScore += 20;

    // 2. Listing Quality Score (0-100)
    let listingQualityScore = 0;
    const imageCount = partData.part_images?.length || 0;
    if (imageCount > 0) listingQualityScore += 20;
    if (imageCount >= 3) listingQualityScore += 15;

    if (partData.description && partData.description.length > 100) listingQualityScore += 15;
    if (partData.description && partData.description.length > 300) listingQualityScore += 10;

    if (sellerProfile?.verification_status === 'verified') listingQualityScore += 25;

    // Recency bonus (last 30 days)
    const daysOld = (Date.now() - new Date(partData.created_at).getTime()) / (1000 * 60 * 60 * 24);
    if (daysOld < 30) listingQualityScore += 15;

    return {
      objectID: partData.id,
      title: partData.title || '',
      description: partData.description || '',
      price: partData.price_mxn || 0,
      status: partData.status || 'AVAILABLE',

      // Facetable Attributes
      make: vehicleMake?.name || 'Universal',
      model: vehicleModel?.name || 'N/A',
      year: vehicleVariant?.year || null,
      fitment_signatures: fitmentSignatures,

      category: category?.slug_en || 'other',
      category_label: category?.name_en || 'Other',
      part_type: partType?.slug_en || 'general',
      part_type_label: partType?.name_en || 'General',

      condition: partData.condition || 'USED_GOOD',

      seller_name: sellerProfile?.business_name || 'Particular',
      seller_verified: sellerProfile?.verification_status === 'verified',
      seller_trust_score:
        sellerProfile?.seller_trust_score && sellerProfile.seller_trust_score > 0
          ? sellerProfile.seller_trust_score
          : sellerTrustScore,

      location: sellerProfile?.location || 'N/A',

      image_url:
        partData.part_images?.find((img) => img.is_primary)?.url ||
        partData.part_images?.[0]?.url ||
        null,
      listing_quality_score:
        partData.listing_quality_score && partData.listing_quality_score > 0
          ? partData.listing_quality_score
          : listingQualityScore,
      created_at: Math.floor(new Date(partData.created_at).getTime() / 1000),
    };
  }
}
