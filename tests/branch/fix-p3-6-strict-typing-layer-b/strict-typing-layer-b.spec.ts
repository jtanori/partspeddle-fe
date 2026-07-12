import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AlgoliaSearchRepository } from '../../../src/backend/modules/search/infrastructure/algolia-search-repository';
import { BuildSearchDocumentUseCase } from '../../../src/backend/modules/search/application/build-search-document';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { SearchFilters } from '../../../src/backend/modules/search/domain/search-filters';

vi.mock('@/lib/supabase-admin', () => ({
  supabaseAdmin: {
    from: vi.fn(),
  },
}));

describe('P3.6 Layer B strict typing regression', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('AlgoliaSearchRepository', () => {
    const repo = new AlgoliaSearchRepository();

    it('builds filters without explicit any types', () => {
      const filters: SearchFilters = {
        makeIds: ['Honda', "O'Reilly"],
        categoryIds: ['Electrical'],
        condition: ['new'],
        verifiedOnly: true,
        yearMin: 2010,
        yearMax: 2020,
        priceMin: 100,
        priceMax: 500,
        fitmentSignatures: ['1:2:2015'],
      };

      expect(repo.buildAlgoliaFilters(filters)).toBe(
        "(make:'Honda' OR make:'O''Reilly') AND year >= 2010 AND year <= 2020 AND (fitment_signatures:'1:2:2015') AND (category:'Electrical') AND (condition:'new') AND seller_verified:true AND price >= 100 AND price <= 500",
      );
    });

    it('ignores non-string and empty facet values', () => {
      const filters = { makeIds: ['Honda', '', 123, null] } as unknown as SearchFilters;
      expect(repo.buildAlgoliaFilters(filters)).toBe("(make:'Honda')");
    });
  });

  describe('BuildSearchDocumentUseCase', () => {
    const useCase = new BuildSearchDocumentUseCase();

    function mockSupabaseReturn(data: unknown) {
      (supabaseAdmin.from as ReturnType<typeof vi.fn>).mockReturnValue({
        select: () => ({
          eq: () => ({
            single: () => Promise.resolve({ data, error: null }),
          }),
        }),
      });
    }

    it('builds a document from typed nested relations', async () => {
      mockSupabaseReturn({
        id: 'part-123',
        title: 'Alternator',
        description: 'A'.repeat(250),
        price_mxn: 1200,
        status: 'AVAILABLE',
        condition: 'USED_GOOD',
        created_at: new Date().toISOString(),
        listing_quality_score: 85,
        part_types: {
          slug_en: 'alternator',
          name_en: 'Alternator',
          categories: {
            slug_en: 'electrical',
            name_en: 'Electrical',
          },
        },
        vehicle_variants: {
          year: 2015,
          models: {
            id: 'model-1',
            name: 'Civic',
            makes: {
              id: 'make-1',
              name: 'Honda',
            },
          },
        },
        part_fitment: [
          {
            vehicle_variant_id: 'variant-1',
            vehicle_variants: {
              year: 2015,
              models: {
                id: 'model-1',
                name: 'Civic',
                makes: {
                  id: 'make-1',
                  name: 'Honda',
                },
              },
            },
          },
        ],
        users: {
          seller_profiles: {
            business_name: 'Yonke',
            location: 'Tijuana',
            verification_status: 'verified',
            whatsapp: '+521234567890',
            seller_trust_score: 80,
          },
        },
        part_images: [{ id: 'img-1', url: 'https://example.com/img.jpg', is_primary: true }],
      });

      const doc = await useCase.execute('part-123');

      expect(doc.objectID).toBe('part-123');
      expect(doc.make).toBe('Honda');
      expect(doc.model).toBe('Civic');
      expect(doc.year).toBe(2015);
      expect(doc.fitment_signatures).toContain('make-1:model-1:2015');
      expect(doc.seller_trust_score).toBe(80);
      expect(doc.listing_quality_score).toBe(85);
      expect(doc.image_url).toBe('https://example.com/img.jpg');
    });
  });
});
