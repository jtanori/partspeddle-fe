import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BuildSearchDocumentUseCase } from '../../../src/backend/modules/search/application/build-search-document';
import { supabaseAdmin } from '@/lib/supabase-admin';

vi.mock('@/lib/supabase-admin', () => ({
  supabaseAdmin: {
    from: vi.fn(),
  },
}));

describe('BuildSearchDocumentUseCase', () => {
  const useCase = new BuildSearchDocumentUseCase();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  function mockSupabaseReturn(data: unknown) {
    (supabaseAdmin.from as ReturnType<typeof vi.fn>).mockReturnValue({
      select: () => ({
        eq: () => ({
          single: () => Promise.resolve({ data, error: null }),
        }),
      }),
    });
  }

  it('successfully builds a search document', async () => {
    const mockPart = {
      id: 'part-123',
      title: 'Alternator',
      description: 'A'.repeat(250),
      price_mxn: 100,
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
          name: 'Civic',
          makes: {
            name: 'Honda',
          },
        },
      },
      part_fitment: [],
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
    };

    mockSupabaseReturn(mockPart);

    const doc = await useCase.execute('part-123');

    expect(doc.objectID).toBe('part-123');
    expect(doc.title).toBe('Alternator');
    expect(doc.make).toBe('Honda');
    expect(doc.model).toBe('Civic');
    expect(doc.year).toBe(2015);
    expect(doc.category).toBe('electrical');
    expect(doc.category_label).toBe('Electrical');
    expect(doc.part_type).toBe('alternator');
    expect(doc.part_type_label).toBe('Alternator');
    expect(doc.seller_name).toBe('Yonke');
    expect(doc.seller_verified).toBe(true);
    expect(doc.seller_trust_score).toBe(80);
    expect(doc.listing_quality_score).toBe(85);
    expect(doc.image_url).toBe('https://example.com/img.jpg');
    expect(doc.created_at).toBeGreaterThan(0);
  });

  it('computes fallback scores when DB columns are zero', async () => {
    const mockPart = {
      id: 'part-456',
      title: 'Brake Pad',
      description: 'A'.repeat(50),
      price_mxn: 200,
      status: 'AVAILABLE',
      condition: 'NEW',
      created_at: new Date().toISOString(),
      listing_quality_score: 0,
      part_types: {
        slug_en: 'brake-pad',
        name_en: 'Brake Pad',
        categories: {
          slug_en: 'brakes',
          name_en: 'Brakes',
        },
      },
      vehicle_variants: null,
      part_fitment: [],
      users: {
        seller_profiles: {
          business_name: 'Particular',
          location: 'N/A',
          verification_status: 'pending',
          whatsapp: null,
          seller_trust_score: 0,
        },
      },
      part_images: [],
    };

    mockSupabaseReturn(mockPart);

    const doc = await useCase.execute('part-456');

    expect(doc.objectID).toBe('part-456');
    expect(doc.seller_verified).toBe(false);
    expect(doc.seller_trust_score).toBe(40);
    expect(doc.listing_quality_score).toBeGreaterThan(0);
  });

  it('throws an error if part is not found', async () => {
    mockSupabaseReturn(null);

    await expect(useCase.execute('part-404')).rejects.toThrow('Part not found: part-404');
  });
});
