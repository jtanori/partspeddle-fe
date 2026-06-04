import { supabaseAdmin } from '@/lib/supabase-admin';
import { SearchDocument } from '../domain/search-document';

export class BuildSearchDocumentUseCase {
  async execute(partId: string): Promise<SearchDocument> {
    const { data: part, error: partError } = await supabaseAdmin
      .from('parts')
      .select(`
        id,
        title,
        description,
        price_mxn,
        created_at,
        part_types (
          id,
          name,
          categories (
            id,
            name
          )
        ),
        seller_profiles (
          user_id,
          verification_status
        ),
        part_fitment (
          vehicle_variants (
            id,
            year,
            vehicle_models (
              id,
              name,
              vehicle_makes (
                id,
                name
              )
            )
          )
        ),
        part_images (
          id
        )
      `)
      .eq('id', partId)
      .single();

    if (partError || !part) {
      throw new Error(`Part not found: ${partId}`);
    }

    // Process fitment data
    const fitments = part.part_fitment || [];
    const makeNames = Array.from(new Set(fitments.map((f: any) => f.vehicle_variants?.vehicle_models?.vehicle_makes?.name))).filter(Boolean) as string[];
    const makeIds = Array.from(new Set(fitments.map((f: any) => f.vehicle_variants?.vehicle_models?.vehicle_makes?.id))).filter(Boolean) as string[];
    const modelNames = Array.from(new Set(fitments.map((f: any) => f.vehicle_variants?.vehicle_models?.name))).filter(Boolean) as string[];
    const modelIds = Array.from(new Set(fitments.map((f: any) => f.vehicle_variants?.vehicle_models?.id))).filter(Boolean) as string[];
    const years = Array.from(new Set(fitments.map((f: any) => f.vehicle_variants?.year))).filter(Boolean) as number[];

    // Quality Score Calculation
    let listingQualityScore = 0;
    if (part.part_images && part.part_images.length > 0) listingQualityScore += 20;
    if (part.description && part.description.length > 200) listingQualityScore += 10;
    if (part.seller_profiles?.verification_status === 'verified') listingQualityScore += 25;
    if (fitments.length > 0) listingQualityScore += 15;
    // Recent listing (within 30 days)
    if (new Date(part.created_at).getTime() > Date.now() - 30 * 24 * 60 * 60 * 1000) listingQualityScore += 10;

    return {
      objectID: part.id,
      partId: part.id,
      title: part.title || '',
      description: part.description || '',
      price: part.price_mxn || 0,
      condition: 'used', // Default based on earlier research
      makeNames,
      makeIds,
      modelNames,
      modelIds,
      years,
      categoryName: part.part_types?.categories?.name || 'Unknown',
      categoryId: part.part_types?.categories?.id || '',
      partTypeName: part.part_types?.name || 'Unknown',
      partTypeId: part.part_types?.id || '',
      sellerVerified: part.seller_profiles?.verification_status === 'verified',
      sellerTrustScore: 50, // Placeholder, need integration with trust_profiles
      imageCount: part.part_images ? part.part_images.length : 0,
      listingQualityScore,
      createdAt: part.created_at,
    };
  }
}
