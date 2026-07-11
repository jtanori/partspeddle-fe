import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

import { DraftIdentification } from '@/components/seller-dashboard/draft/DraftIdentification';
import { DraftInspector } from '@/components/seller-dashboard/draft/DraftInspector';
import { scoreCompletion } from '@/lib/listing-completion';
import { DEFAULT_DRAFT_PAYLOAD, type DraftCompletion } from '@/domain/types/listing-draft';

vi.mock('next/image', () => ({
  __esModule: true,
  default: ({ src, alt }: { src: string; alt: string }) => <img src={src} alt={alt} />,
}));

function readSource(relativePath: string): string {
  return readFileSync(resolve(process.cwd(), relativePath), 'utf-8');
}

function fileExists(relativePath: string): boolean {
  return existsSync(resolve(process.cwd(), relativePath));
}

describe('P5.0 Listing Draft / AI-assisted Wizard', () => {
  describe('schema and domain model', () => {
    it('creates the listing_drafts migration', () => {
      const source = readSource('supabase/migrations/20260715000000_create_listing_drafts.sql');
      expect(source).toContain('CREATE TABLE IF NOT EXISTS "public"."listing_drafts"');
      expect(source).toContain('"seller_id" "uuid" NOT NULL');
      expect(source).toContain('"payload" "jsonb"');
      expect(source).toContain('CREATE OR REPLACE FUNCTION public.publish_listing_draft');
    });

    it('defines DraftModule union and ListingDraft interface', () => {
      const source = readSource('src/domain/types/listing-draft.ts');
      expect(source).toContain("export type DraftModule =");
      expect(source).toContain("'identification'");
      expect(source).toContain("'media'");
      expect(source).toContain("'fitment'");
      expect(source).toContain("'pricing'");
      expect(source).toContain("'shipping'");
      expect(source).toContain("'seo'");
      expect(source).toContain('export interface ListingDraft');
      expect(source).toContain('export const DEFAULT_DRAFT_PAYLOAD');
    });
  });

  describe('API routes', () => {
    it('exposes the active draft route', () => {
      expect(fileExists('src/app/api/seller/drafts/active/route.ts')).toBe(true);
      const source = readSource('src/app/api/seller/drafts/active/route.ts');
      expect(source).toContain('export async function GET');
      expect(source).toContain('requireSeller');
      expect(source).toContain("from('listing_drafts')");
      expect(source).toContain('DEFAULT_DRAFT_PAYLOAD');
    });

    it('exposes the draft upsert route', () => {
      expect(fileExists('src/app/api/seller/drafts/[id]/route.ts')).toBe(true);
      const source = readSource('src/app/api/seller/drafts/[id]/route.ts');
      expect(source).toContain('export async function GET');
      expect(source).toContain('export async function PATCH');
      expect(source).toContain('requireSeller');
      expect(source).toContain('scoreCompletion');
    });

    it('exposes the publish route backed by the publish_listing_draft RPC', () => {
      expect(fileExists('src/app/api/seller/drafts/[id]/publish/route.ts')).toBe(true);
      const source = readSource('src/app/api/seller/drafts/[id]/publish/route.ts');
      expect(source).toContain('export async function POST');
      expect(source).toContain('requireSeller');
      expect(source).toContain(".rpc('publish_listing_draft'");
      expect(source).toContain('partId: data');
    });

    it('exposes the discard route', () => {
      expect(fileExists('src/app/api/seller/drafts/[id]/discard/route.ts')).toBe(true);
      const source = readSource('src/app/api/seller/drafts/[id]/discard/route.ts');
      expect(source).toContain('export async function POST');
      expect(source).toContain('requireSeller');
      expect(source).toContain("status: 'discarded'");
    });
  });

  describe('data hooks', () => {
    it('uses the drafts API and exposes autosave helpers', () => {
      const source = readSource('src/hooks/useListingDraft.ts');
      expect(source).toContain('/api/seller/drafts/active');
      expect(source).toContain('/api/seller/drafts/');
      expect(source).toContain('updateModule');
      expect(source).toContain('updateMarketSignals');
      expect(source).toContain('publish');
      expect(source).toContain('discard');
      expect(source).toContain('setTimeout');
      expect(source).toContain('750');
    });

    it('does not talk directly to Supabase from the hook', () => {
      const source = readSource('src/hooks/useListingDraft.ts');
      expect(source).not.toContain('supabase.from');
      expect(source).not.toContain('supabase.rpc');
      expect(source).not.toContain('supabase.storage');
    });
  });

  describe('wizard refactor', () => {
    it('rewrites ListingWizard as a tabbed draft editor', () => {
      const source = readSource('src/components/seller-dashboard/ListingWizard.tsx');
      expect(source).toContain('useListingDraft');
      expect(source).toContain("from '@/components/ui/tabs'");
      expect(source).toContain('MODULE_TABS');
      expect(source).not.toContain('StageOneMedia');
      expect(source).not.toContain('StageTwoTaxonomy');
      expect(source).not.toContain('StageThreeLogistics');
    });

    it('imports all draft module components', () => {
      const source = readSource('src/components/seller-dashboard/ListingWizard.tsx');
      expect(source).toContain('DraftIdentification');
      expect(source).toContain('DraftMedia');
      expect(source).toContain('DraftFitment');
      expect(source).toContain('DraftPricing');
      expect(source).toContain('DraftShipping');
      expect(source).toContain('DraftSEO');
      expect(source).toContain('DraftInspector');
    });

    it('wires the create page to ListingWizard', () => {
      const source = readSource('src/app/(seller)/seller/create/page.tsx');
      expect(source).toContain('ListingWizard');
      expect(source).toContain('PageHeader');
    });
  });

  describe('draft module components', () => {
    it('DraftIdentification renders fields and calls onChange', () => {
      const onChange = vi.fn();
      render(
        <DraftIdentification
          value={DEFAULT_DRAFT_PAYLOAD.identification}
          onChange={onChange}
        />,
      );

      const titleInput = screen.getByLabelText(/Part Title/i);
      expect(titleInput).toBeDefined();

      fireEvent.change(titleInput, { target: { value: 'New Transmission' } });
      expect(onChange).toHaveBeenCalledWith({ title: 'New Transmission' });
    });
  });

  describe('inspector panel', () => {
    it('renders total completion percentage', () => {
      const completion: DraftCompletion = {
        identification: 80,
        media: 100,
        fitment: 50,
        pricing: 100,
        shipping: 0,
        seo: 0,
        total: 55,
      };

      render(
        <DraftInspector
          draft={null}
          completion={completion}
          onPublish={() => {}}
        />,
      );

      expect(screen.getByText('55%')).toBeDefined();
      expect(screen.getByText('Identification')).toBeDefined();
      expect(screen.getByText('Media')).toBeDefined();
      expect(screen.getByText('Publish Listing')).toBeDefined();
    });
  });

  describe('completion scoring', () => {
    it('scores a completely empty payload at 0%', () => {
      const result = scoreCompletion(DEFAULT_DRAFT_PAYLOAD);
      expect(result.total).toBe(0);
    });

    it('scores a complete payload at 100%', () => {
      const payload = {
        ...DEFAULT_DRAFT_PAYLOAD,
        identification: {
          title: 'Transmission',
          category: 'Powertrain',
          partType: 'Component',
          brand: 'Ford',
          stockNumber: 'STK-001',
          description: '',
          system: '',
          model: '',
          oemPartNumber: '',
        },
        media: { images: [{ id: '1', fileName: 'a.jpg', publicUrl: 'http://x/a.jpg', isPrimary: true }], mode: 'component' as const, aiData: null },
        fitment: { vehicles: [{ vehicleVariantId: 'v1', notes: '' }] },
        pricing: { priceMXN: 5000, condition: 'USED_GOOD' as const },
        shipping: { method: 'FedEx', costEstimateMXN: null, notes: '' },
        seo: { searchableText: 'ford transmission', tags: [] },
      };

      const result = scoreCompletion(payload);
      expect(result.identification).toBe(100);
      expect(result.media).toBe(100);
      expect(result.fitment).toBe(100);
      expect(result.pricing).toBe(100);
      expect(result.shipping).toBe(100);
      expect(result.seo).toBe(100);
      expect(result.total).toBe(100);
    });
  });
});
