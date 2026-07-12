import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function read(relativePath: string): string {
  return fs.readFileSync(path.resolve(__dirname, '../../../', relativePath), 'utf-8');
}

function fileExists(relativePath: string): boolean {
  return fs.existsSync(path.resolve(__dirname, '../../../', relativePath));
}

describe('P2.6 decouple Supabase from presentation', () => {
  it('exposes taxonomy through a server API route', () => {
    const route = read('src/app/api/taxonomy/route.ts');
    expect(route).toContain('createRepositories');
    expect(route).toContain('catalog.getTaxonomy');
  });

  it('routes useTaxonomy through the taxonomy API', () => {
    const hook = read('src/hooks/useTaxonomy.ts');
    expect(hook).toContain('/api/taxonomy');
    expect(hook).not.toContain('supabase.from');
  });

  it('adds seller profile and inventory API routes', () => {
    expect(fileExists('src/app/api/seller/profile/route.ts')).toBe(true);
    expect(fileExists('src/app/api/seller/inventory/route.ts')).toBe(true);
    expect(fileExists('src/app/api/seller/inventory/commit/route.ts')).toBe(true);
    expect(fileExists('src/app/api/seller/assets/upload/route.ts')).toBe(true);

    const profileRoute = read('src/app/api/seller/profile/route.ts');
    expect(profileRoute).toContain('export async function GET');
    expect(profileRoute).toContain('requireSeller');
  });

  it('uses domain hooks instead of direct Supabase in seller presentation', () => {
    const layout = read('src/app/(seller)/layout.tsx');
    const inventory = read('src/components/seller-dashboard/InventoryTable.tsx');
    const wizard = read('src/components/seller-dashboard/ListingWizard.tsx');
    const draftHook = read('src/hooks/useListingDraft.ts');

    expect(layout).toContain('useSellerProfile');
    expect(layout).not.toContain('supabase.from');

    expect(inventory).toContain('useSellerInventory');
    expect(inventory).not.toContain('supabase.from');

    // Draft wizard communicates through the drafts API, not direct Supabase.
    expect(wizard).toContain('useListingDraft');
    expect(draftHook).toContain('/api/seller/drafts');
    expect(wizard).not.toContain('supabase.storage');
    expect(wizard).not.toContain('supabase.rpc');
    expect(draftHook).not.toContain('supabase.storage');
    expect(draftHook).not.toContain('supabase.rpc');
  });

  it('uses homepage and seller hooks backed by public APIs', () => {
    const homepage = read('src/components/Homepage.tsx');
    const featuredSellers = read('src/components/homepage/FeaturedSellers.tsx');
    const popularSellers = read('src/components/homepage/PopularSellersSection.tsx');

    expect(homepage).toContain('useHomepageData');
    expect(homepage).not.toContain('supabaseDb');

    expect(featuredSellers).toContain('useTopSellers');
    expect(featuredSellers).not.toContain('supabaseDb');

    expect(popularSellers).toContain('useTopSellers');
    expect(popularSellers).not.toContain('supabase.from');
  });

  it('routes dropdown search through the search API', () => {
    const dropdown = read('src/components/search/SearchDropdownController.tsx');
    expect(dropdown).toContain('/api/search/parts');
    expect(dropdown).not.toContain('supabaseDb');
  });

  it('centralizes realtime messaging in a dedicated module', () => {
    const hook = read('src/hooks/useMessaging.ts');
    const channel = read('src/lib/realtime/messaging-channel.ts');

    expect(hook).toContain('subscribeToConversation');
    expect(hook).not.toContain("supabase.channel");
    expect(channel).toContain('subscribeToConversation');
  });

  it('shares API mappers between service and hook layers', () => {
    const mappers = read('src/lib/api-mappers.ts');
    const supabaseDb = read('src/services/supabase-db.ts');
    const homepageHook = read('src/hooks/useHomepageData.ts');

    expect(mappers).toContain('mapPartToPart');
    expect(mappers).toContain('mapSellerToSeller');
    expect(supabaseDb).toContain('@/lib/api-mappers');
    expect(homepageHook).toContain('@/lib/api-mappers');
  });
});