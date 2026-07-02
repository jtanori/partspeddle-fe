import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { getUserRole } from '@/lib/user-roles';

vi.mock('@supabase/ssr', () => ({
  createServerClient: vi.fn(),
}));

vi.mock('@/lib/user-roles', () => ({
  getUserRole: vi.fn(),
}));

const getUserRoleMock = vi.mocked(getUserRole);
const createServerClientMock = vi.mocked(createServerClient);

async function loadAdminAuth() {
  const mod = await import('../../../src/lib/admin-auth');
  return mod.requireAdmin;
}

function createRequest(cookies: Record<string, string> = {}): NextRequest {
  return {
    cookies: {
      getAll: () => Object.entries(cookies).map(([name, value]) => ({ name, value })),
    },
  } as unknown as NextRequest;
}

function mockSession(present: boolean) {
  createServerClientMock.mockReturnValue({
    auth: {
      getSession: () =>
        Promise.resolve({
          data: {
            session: present
              ? {
                  user: { id: 'user-1' },
                }
              : null,
          },
          error: null,
        }),
    },
  } as any);
}

describe('requireAdmin', () => {
  beforeEach(() => {
    getUserRoleMock.mockReset();
    createServerClientMock.mockReset();
  });

  it('returns 401 when there is no session', async () => {
    await mockSession(false);
    const requireAdmin = await loadAdminAuth();
    const result = await requireAdmin(createRequest());
    expect(result.isAdmin).toBe(false);
    expect(result.response).toEqual({ error: 'Unauthorized', status: 401 });
  });

  it('returns 403 for a buyer session', async () => {
    await mockSession(true);
    getUserRoleMock.mockResolvedValue('buyer');
    const requireAdmin = await loadAdminAuth();
    const result = await requireAdmin(createRequest());
    expect(result.isAdmin).toBe(false);
    expect(result.response).toEqual({ error: 'Forbidden', status: 403 });
  });

  it('returns 403 for a seller session', async () => {
    await mockSession(true);
    getUserRoleMock.mockResolvedValue('seller');
    const requireAdmin = await loadAdminAuth();
    const result = await requireAdmin(createRequest());
    expect(result.isAdmin).toBe(false);
    expect(result.response).toEqual({ error: 'Forbidden', status: 403 });
  });

  it('succeeds for an admin session', async () => {
    await mockSession(true);
    getUserRoleMock.mockResolvedValue('admin');
    const requireAdmin = await loadAdminAuth();
    const result = await requireAdmin(createRequest());
    expect(result.isAdmin).toBe(true);
    expect(result.response).toBeNull();
    expect(result.role).toBe('admin');
  });
});
