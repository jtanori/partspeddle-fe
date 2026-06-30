import { ListingRepository } from '../repositories/listing.repository';
import { MarketplaceListing } from '../domain/marketplace.types';
import { supabaseAdmin } from '../lib/supabase-admin';

export class SupabaseListingRepository implements ListingRepository {
  async findById(id: string): Promise<MarketplaceListing | null> {
    const { data, error } = await supabaseAdmin
      .from('listings')
      .select(`
        *,
        parts(*),
        donor_vehicles(*),
        listing_specifications(
          value_text, value_number, value_boolean,
          catalog_spec_definitions(key, label, unit, data_type)
        )
      `)
      .eq('id', id)
      .single();

    if (error || !data) return null;

    console.log(`[SCGS DEBUG] Raw DB data for ${id}:`, { 
        listing_quality_score: (data as any).listing_quality_score,
        seller_trust_score: (data as any).seller_trust_score,
        created_at: data.created_at
    });

    const baseListing = {
      id: data.id,
      listingType: data.listing_type,
      sellerId: data.seller_id,
      categoryId: data.parts?.category_id || data.donor_vehicles?.category_id,
      title: data.parts?.title || data.donor_vehicles?.title || 'Unknown',
      description: data.parts?.description || data.donor_vehicles?.description || '',
      createdAt: data.created_at,
      inventory: { 
        condition: data.parts?.condition || 'USED', 
        availabilityStatus: data.status 
      },
      pricing: { askingPrice: data.price, currency: data.currency || 'USD' },
      listingQualityScore: data.listing_quality_score || 0,
      sellerTrustScore: data.seller_trust_score || 0,
      specifications: data.listing_specifications.map((s: any) => ({
        key: s.catalog_spec_definitions.key,
        label: s.catalog_spec_definitions.label,
        value: s.value_number ?? s.value_text ?? s.value_boolean ?? '',
        unit: s.catalog_spec_definitions.unit
      }))
    };

    if (data.listing_type === 'PART') {
      return {
        ...baseListing,
        listingType: 'PART',
        partNumber: data.parts.part_number,
        oemPartNumber: data.parts.oem_part_number
      } as PartListing;
    } else {
      return {
        ...baseListing,
        listingType: 'DONOR_VEHICLE',
        vin: data.donor_vehicles.vin,
        mileage: data.donor_vehicles.mileage,
        dismantleStatus: data.donor_vehicles.dismantle_status
      } as DonorVehicleListing;
    }
  }
}
