import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { NextRequest } from 'next/server';

const createServerClientMock = vi.fn();
vi.mock('@supabase/ssr', () => ({
  createServerClient: createServerClientMock,
}));

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

function mockSession(role: string | null, error: Error | null = null) {
  createServerClientMock.mockReturnValue({
    auth: {
      getSession: () =>
        Promise.resolve({
          data: {
            session: role
              ? {
                  user: {
                    user_metadata: { role },
                  },
                }
              : null,
          },
          error,
        }),
    },
  });
}

describe('requireAdmin', () => {
  beforeEach(() => {
    createServerClientMock.mockReset();
  });

  it('returns 401 when there is no session', async () => {
    mockSession(null);
    const requireAdmin = await loadAdminAuth();
    const result = await requireAdmin(createRequest());
    expect(result.isAdmin).toBe(false);
    expect(result.response).toEqual({ error: 'Unauthorized', status: 401 });
  });

  it('returns 403 for a buyer session', async () => {
    mockSession('buyer');
    const requireAdmin = await loadAdminAuth();
    const result = await requireAdmin(createRequest());
    expect(result.isAdmin).toBe(false);
    expect(result.response).toEqual({ error: 'Forbidden', status: 403 });
  });

  it('returns 403 for a seller session', async () => {
    mockSession('seller');
    const requireAdmin = await loadAdminAuth();
    const result = await requireAdmin(createRequest());
    expect(result.isAdmin).toBe(false);
    expect(result.response).toEqual({ error: 'Forbidden', status: 403 });
  });

  it('succeeds for an admin session', async () => {
    mockSession('admin');
    const requireAdmin = await loadAdminAuth();
    const result = await requireAdmin(createRequest());
    expect(result.isAdmin).toBe(true);
    expect(result.response).toBeNull();
    expect(result.role).toBe('admin');
  });
});
