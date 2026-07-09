import { describe, it, expect, vi } from 'vitest';
import { NextResponse } from 'next/server';
import { safeErrorResponse } from '@/lib/api/errors';
import { requireSeller, requireAuthenticated } from '@/lib/seller-auth';
import { requireAdmin } from '@/lib/admin-auth';

vi.mock('@supabase/ssr', () => ({
  createServerClient: vi.fn(),
}));

vi.mock('@/lib/user-roles', () => ({
  getUserRole: vi.fn(),
}));

const createServerClientMock = vi.fn();
const getUserRoleMock = vi.fn();

function createRequest(): any {
  return { cookies: { getAll: () => [] }, headers: new Headers() };
}

function mockSession(role: string | null) {
  createServerClientMock.mockReturnValue({
    auth: {
      getUser: () =>
        Promise.resolve({ data: { user: role ? { id: 'user-1' } : null }, error: null }),
    },
  });
  getUserRoleMock.mockResolvedValue(role);
}

describe('api auth negative tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    createServerClientMock.mockReset();
    getUserRoleMock.mockReset();
  });

  it('requireSeller returns 401 without session', async () => {
    mockSession(null);
    const result = await requireSeller(createRequest());
    expect(result.user).toBeNull();
    expect(result.error?.status).toBe(401);
  });

  it('requireSeller returns 403 for a buyer', async () => {
    mockSession('buyer');
    const result = await requireSeller(createRequest());
    expect(result.error?.status).toBe(403);
  });

  it('requireAdmin returns 401 without session', async () => {
    mockSession(null);
    const result = await requireAdmin(createRequest());
    expect(result.isAdmin).toBe(false);
    expect(result.response?.status).toBe(401);
  });

  it('requireAdmin returns 403 for a seller', async () => {
    mockSession('seller');
    const result = await requireAdmin(createRequest());
    expect(result.isAdmin).toBe(false);
    expect(result.response?.status).toBe(403);
  });

  it('safeErrorResponse does not leak internal details', () => {
    const res = safeErrorResponse('Internal database connection failed.', 500);
    expect(res.status).toBe(500);
  });
});
