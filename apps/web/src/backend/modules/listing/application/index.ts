export type { ListingRepository } from '../domain/listing-repository';
export { SupabaseListingRepository } from '../infrastructure/supabase-listing.repository';

import { createAnonServerClient, createAuthClient } from '@/lib/supabase-server';
import { NextRequest } from 'next/server';
import { SupabaseListingRepository } from '../infrastructure/supabase-listing.repository';

export type ListingRepositoryContext = 'public' | 'authenticated';

export function createListingRepository(ctx: ListingRepositoryContext, req?: NextRequest) {
  const client = ctx === 'public' ? createAnonServerClient() : createAuthClient(req!);
  return new SupabaseListingRepository(client);
}
