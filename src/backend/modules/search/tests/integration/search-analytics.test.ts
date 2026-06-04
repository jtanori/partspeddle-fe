import { describe, it, expect, vi } from 'vitest';
import { logSearchEventHandler, logSearchClickEventHandler } from '../../contracts/search-analytics-handler';
import { supabaseAdmin } from '@/lib/supabase-admin';

// Mock Supabase
vi.mock('@/lib/supabase-admin', () => ({
  supabaseAdmin: {
    from: vi.fn().mockReturnThis(),
    insert: vi.fn().mockResolvedValue({ data: null, error: null }),
  },
}));

describe('Search Analytics Persistence', () => {
  it('should persist search event', async () => {
    const req = { body: { userId: 'u1', query: 'alternator', resultCount: 5 } } as any;
    const res = { status: vi.fn().mockReturnThis(), json: vi.fn() } as any;

    await logSearchEventHandler(req, res);

    expect(supabaseAdmin.from).toHaveBeenCalledWith('search_events');
    expect(res.status).toHaveBeenCalledWith(201);
  });

  it('should persist click event', async () => {
    const req = { body: { searchEventId: 's1', partId: 'p1', position: 1 } } as any;
    const res = { status: vi.fn().mockReturnThis(), json: vi.fn() } as any;

    await logSearchClickEventHandler(req, res);

    expect(supabaseAdmin.from).toHaveBeenCalledWith('search_click_events');
    expect(res.status).toHaveBeenCalledWith(201);
  });
});
