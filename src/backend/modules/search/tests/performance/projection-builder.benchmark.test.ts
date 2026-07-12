import { describe, it, expect, vi } from 'vitest';
import { BuildSearchDocumentUseCase } from '../../application/build-search-document';
import { supabaseAdmin } from '@/lib/supabase-admin';

vi.mock('@/lib/supabase-admin', () => ({
  supabaseAdmin: {
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({
      data: {
        id: 'p1',
        title: 'Test',
        description: 'Test'.repeat(100),
        price_mxn: 100,
        created_at: new Date().toISOString(),
        part_types: { id: 't1', name: 'A', categories: { id: 'c1', name: 'B' } },
        seller_profiles: { user_id: 'u1', verification_status: 'verified' },
        part_fitment: [],
        part_images: []
      },
      error: null
    }),
  },
}));

describe('Projection Builder Performance', () => {
  const runScaleTest = async (count: number) => {
    const builder = new BuildSearchDocumentUseCase();
    const start = performance.now();
    
    for (let i = 0; i < count; i++) {
      await builder.execute('p1');
    }
    
    const end = performance.now();
    return end - start;
  };

  it('should project 100 documents under 2s', async () => {
    const duration = await runScaleTest(100);
    expect(duration).toBeLessThan(2000);
    console.log(`Projection build time (100 docs): ${duration.toFixed(2)}ms`);
  });

  it('should project 1000 documents under 10s', async () => {
    const duration = await runScaleTest(1000);
    expect(duration).toBeLessThan(10000);
    console.log(`Projection build time (1000 docs): ${duration.toFixed(2)}ms`);
  });
});
