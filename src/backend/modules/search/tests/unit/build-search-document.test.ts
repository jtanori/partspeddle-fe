import { describe, it, expect, vi } from 'vitest';
import { BuildSearchDocumentUseCase } from '../../application/build-search-document';
import { supabaseAdmin } from '@/lib/supabase-admin';

// Mock Supabase Admin
vi.mock('@/lib/supabase-admin', () => ({
  supabaseAdmin: {
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn(),
  },
}));

describe('BuildSearchDocumentUseCase', () => {
  it('should correctly project a part into a SearchDocument', async () => {
    // Setup mock response
    const mockPart = {
      id: 'part-123',
      title: 'Test Part',
      description: 'A'.repeat(201),
      price_mxn: 100,
      created_at: new Date().toISOString(),
      part_types: { id: 'type-1', name: 'Alternator', categories: { id: 'cat-1', name: 'Electrical' } },
      seller_profiles: { user_id: 'user-1', verification_status: 'verified' },
      part_fitment: [{ vehicle_variants: { id: 'var-1', year: 2020, vehicle_models: { id: 'mod-1', name: 'F150', vehicle_makes: { id: 'make-1', name: 'Ford' } } } }],
      part_images: [{ id: 'img-1' }]
    };
    
    vi.mocked(supabaseAdmin.from('').select('').eq('').single).mockResolvedValue({ data: mockPart, error: null });

    const builder = new BuildSearchDocumentUseCase();
    const result = await builder.execute('part-123');

    expect(result.partId).toBe('part-123');
    expect(result.title).toBe('Test Part');
    expect(result.makeNames).toContain('Ford');
    expect(result.listingQualityScore).toBeGreaterThan(0); // Should be > 0 based on criteria
  });
});
