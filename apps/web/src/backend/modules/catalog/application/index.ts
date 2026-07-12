export { CatalogRepository } from '../domain/catalog-repository';
export { SpecificationRepository } from '../domain/specification-repository';
export { SupabaseCatalogRepository } from '../infrastructure/supabase-catalog.repository';

import { createAnonServerClient, createAuthClient } from '@/lib/supabase-server';
import { NextRequest } from 'next/server';
import { SupabaseCatalogRepository } from '../infrastructure/supabase-catalog.repository';

export type CatalogRepositoryContext = 'public' | 'authenticated';

export function createCatalogRepository(ctx: CatalogRepositoryContext, req?: NextRequest) {
  const client = ctx === 'public' ? createAnonServerClient() : createAuthClient(req!);
  return new SupabaseCatalogRepository(client);
}
