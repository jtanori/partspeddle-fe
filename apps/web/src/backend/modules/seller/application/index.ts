export { SellerRepository } from '../domain/seller-repository';
export { SellerProfile } from '../domain/seller-profile';
export { SupabaseSellerRepository } from '../infrastructure/supabase-seller.repository';

import { createAnonServerClient, createAuthClient } from '@/lib/supabase-server';
import { NextRequest } from 'next/server';
import { SupabaseSellerRepository } from '../infrastructure/supabase-seller.repository';

export type SellerRepositoryContext = 'public' | 'authenticated';

export function createSellerRepository(ctx: SellerRepositoryContext, req?: NextRequest) {
  const client = ctx === 'public' ? createAnonServerClient() : createAuthClient(req!);
  return new SupabaseSellerRepository(client);
}
