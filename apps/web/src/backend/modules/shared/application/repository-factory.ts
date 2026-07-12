import { createAnonServerClient, createAuthClient } from '@/lib/supabase-server';
import { NextRequest } from 'next/server';
import { SupabaseCatalogRepository } from '@/backend/modules/catalog/infrastructure/supabase-catalog.repository';
import { SupabaseListingRepository } from '@/backend/modules/listing/infrastructure/supabase-listing.repository';
import { SupabaseSellerRepository } from '@/backend/modules/seller/infrastructure/supabase-seller.repository';

export type RepositoryContext = 'public' | 'authenticated';

export interface Repositories {
  catalog: SupabaseCatalogRepository;
  listing: SupabaseListingRepository;
  seller: SupabaseSellerRepository;
}

/**
 * Create repositories backed by the appropriate Supabase client for the
 * request context.
 *
 * - `public`: anon-key client, RLS-enforced public reads.
 * - `authenticated`: cookie-session client bound to the request.
 */
export function createRepositories(ctx: RepositoryContext, req?: NextRequest): Repositories {
  const client = ctx === 'public' ? createAnonServerClient() : createAuthClient(req!);
  return {
    catalog: new SupabaseCatalogRepository(client),
    listing: new SupabaseListingRepository(client),
    seller: new SupabaseSellerRepository(client),
  };
}
