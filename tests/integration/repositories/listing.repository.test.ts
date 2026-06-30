import { describe, it, expect, beforeAll } from 'vitest';
import 'dotenv/config';
import { SupabaseListingRepository } from '../../../src/infrastructure/supabase-listing.repository';
import { supabaseAdmin } from '../../../src/lib/supabase-admin';

describe('ListingRepository Integration', () => {
  const repo = new SupabaseListingRepository();
  let listingId: string;

  beforeAll(async () => {
    console.log('supabaseAdmin type:', typeof supabaseAdmin);
    // Setup: Seed a listing
    const { data: seller } = await supabaseAdmin.from('seller_profiles').select('user_id').limit(1).single();
    const { data: listing } = await supabaseAdmin
      .from('listings')
      .insert([{ seller_id: seller.user_id, listing_type: 'PART', price: 100 }])
      .select()
      .single();
    listingId = listing.id;
  });

  it('hydrates a part listing correctly', async () => {
    const listing = await repo.findById(listingId);
    expect(listing).not.toBeNull();
    expect(listing?.listingType).toBe('PART');
    expect(listing?.pricing.askingPrice).toBe(100);
  });
});
