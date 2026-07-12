import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { getUserRole } from '@/lib/user-roles';
import { supabaseAdmin } from '@/lib/supabase-admin';
import fs from 'fs';
import path from 'path';

vi.mock('@/lib/observability', () => ({
  tracer: {
    startActiveSpan: vi.fn((_name: string, fn: (span: { end: () => void }) => unknown) =>
      fn({ end: vi.fn() }),
    ),
  },
}));

vi.mock('@supabase/ssr', () => ({
  createServerClient: vi.fn(),
}));

vi.mock('@/lib/user-roles', () => ({
  getUserRole: vi.fn(),
}));

vi.mock('@/lib/supabase-admin', () => ({
  supabaseAdmin: {
    auth: {
      getUser: vi.fn(),
    },
  },
}));

const createServerClientMock = vi.mocked(createServerClient);
const getUserRoleMock = vi.mocked(getUserRole);
const supabaseAdminGetUserMock = vi.mocked(supabaseAdmin.auth.getUser);

function createRequest(pathname: string, cookies: Record<string, string> = {}): NextRequest {
  const url = new URL(`http://localhost:3000${pathname}`);
  return {
    nextUrl: {
      pathname,
      clone: () => new URL(url.toString()),
      get searchParams() {
        return url.searchParams;
      },
      get origin() {
        return url.origin;
      },
    },
    cookies: {
      getAll: () => Object.entries(cookies).map(([name, value]) => ({ name, value })),
      set: vi.fn(),
    },
    headers: new Headers(),
  } as unknown as NextRequest;
}

function mockSession(role: string | null) {
  createServerClientMock.mockReturnValue({
    auth: {
      getUser: () =>
        Promise.resolve({
          data: {
            user: role ? { id: 'user-1' } : null,
          },
          error: null,
        }),
    },
  } as any);
  getUserRoleMock.mockResolvedValue(role as any);
}

async function loadProxy() {
  const mod = await import('../../../src/proxy');
  return mod.proxy;
}

async function loadSellerAuth() {
  const mod = await import('../../../src/lib/seller-auth');
  return mod;
}

async function loadAdminAuth() {
  const mod = await import('../../../src/lib/admin-auth');
  return mod.requireAdmin;
}

describe('P5.2 routing, proxy, and session security', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    createServerClientMock.mockReset();
    getUserRoleMock.mockReset();
    supabaseAdminGetUserMock.mockReset();
  });

  describe('seller-auth uses cookie sessions', () => {
    it('returns seller user from a cookie session', async () => {
      mockSession('seller');
      const { requireSeller } = await loadSellerAuth();
      const result = await requireSeller(createRequest('/api/seller/inventory'));

      expect(result.error).toBeNull();
      expect(result.user).toEqual({ id: 'user-1' });
      expect(supabaseAdminGetUserMock).not.toHaveBeenCalled();
    });

    it('returns 401 when there is no cookie session', async () => {
      mockSession(null);
      const { requireSeller } = await loadSellerAuth();
      const result = await requireSeller(createRequest('/api/seller/inventory'));

      expect(result.user).toBeNull();
      expect(result.error?.status).toBe(401);
    });

    it('returns 403 when the user is not a seller', async () => {
      mockSession('buyer');
      const { requireSeller } = await loadSellerAuth();
      const result = await requireSeller(createRequest('/api/seller/inventory'));

      expect(result.user).toBeNull();
      expect(result.error?.status).toBe(403);
    });

    it('requireAuthenticated returns 401 without a session', async () => {
      mockSession(null);
      const { requireAuthenticated } = await loadSellerAuth();
      const result = await requireAuthenticated(createRequest('/api/any'));

      expect(result.user).toBeNull();
      expect(result.error?.status).toBe(401);
    });

    it('requireSellerMachine still validates a Bearer token via service role', async () => {
      supabaseAdminGetUserMock.mockResolvedValue({
        data: { user: { id: 'machine-1' } },
        error: null,
      } as any);

      const { requireSellerMachine } = await loadSellerAuth();
      const req = createRequest('/api/seller/machine');
      req.headers.set('Authorization', 'Bearer machine-token');
      const result = await requireSellerMachine(req);

      expect(result.error).toBeNull();
      expect(result.user).toEqual({ id: 'machine-1' });
      expect(supabaseAdminGetUserMock).toHaveBeenCalledWith('machine-token');
    });
  });

  describe('admin-auth uses cookie sessions', () => {
    it('returns 401 when there is no session', async () => {
      mockSession(null);
      const requireAdmin = await loadAdminAuth();
      const result = await requireAdmin(createRequest('/api/admin/reindex'));
      expect(result.isAdmin).toBe(false);
      expect(result.response).toEqual({ error: 'Unauthorized', status: 401 });
    });

    it('returns 403 for a buyer session', async () => {
      mockSession('buyer');
      const requireAdmin = await loadAdminAuth();
      const result = await requireAdmin(createRequest('/api/admin/reindex'));
      expect(result.isAdmin).toBe(false);
      expect(result.response).toEqual({ error: 'Forbidden', status: 403 });
    });

    it('succeeds for an admin session', async () => {
      mockSession('admin');
      const requireAdmin = await loadAdminAuth();
      const result = await requireAdmin(createRequest('/api/admin/reindex'));
      expect(result.isAdmin).toBe(true);
      expect(result.response).toBeNull();
      expect(result.role).toBe('admin');
    });
  });

  describe('proxy defends API routes with JSON errors', () => {
    it('returns 401 for unauthenticated /api/seller/*', async () => {
      mockSession(null);
      const proxy = await loadProxy();
      const res = await proxy(createRequest('/api/seller/inventory'));
      expect(res.status).toBe(401);
      expect(await res.json()).toEqual({ error: 'Unauthorized' });
    });

    it('returns 403 when a buyer hits /api/seller/*', async () => {
      mockSession('buyer');
      const proxy = await loadProxy();
      const res = await proxy(createRequest('/api/seller/inventory'));
      expect(res.status).toBe(403);
      expect(await res.json()).toEqual({ error: 'Forbidden' });
    });

    it('allows sellers into /api/seller/*', async () => {
      mockSession('seller');
      const proxy = await loadProxy();
      const res = await proxy(createRequest('/api/seller/inventory'));
      expect(res.status).toBe(200);
    });

    it('returns 401 for unauthenticated /api/admin/*', async () => {
      mockSession(null);
      const proxy = await loadProxy();
      const res = await proxy(createRequest('/api/admin/search/reindex'));
      expect(res.status).toBe(401);
      expect(await res.json()).toEqual({ error: 'Unauthorized' });
    });

    it('returns 403 when a seller hits /api/admin/*', async () => {
      mockSession('seller');
      const proxy = await loadProxy();
      const res = await proxy(createRequest('/api/admin/search/reindex'));
      expect(res.status).toBe(403);
      expect(await res.json()).toEqual({ error: 'Forbidden' });
    });

    it('allows admins into /api/admin/*', async () => {
      mockSession('admin');
      const proxy = await loadProxy();
      const res = await proxy(createRequest('/api/admin/search/reindex'));
      expect(res.status).toBe(200);
    });
  });

  describe('proxy hardens refreshed session cookies', () => {
    it('sets hardened cookie options on refresh tokens', async () => {
      const responseCookiesSet = vi.fn();
      const nextSpy = vi
        .spyOn(NextResponse, 'next')
        .mockReturnValue({
          cookies: { set: responseCookiesSet },
          headers: { set: vi.fn() },
        } as any);

      createServerClientMock.mockImplementation((_url: string, _key: string, config: any) => {
        // Trigger a cookie refresh immediately to exercise setAll.
        config.cookies.setAll([
          { name: 'sb-access-token', value: 'access', options: { maxAge: 3600 } },
          { name: 'sb-refresh-token', value: 'refresh', options: { maxAge: 7200 } },
        ]);
        return {
          auth: {
            getUser: () => Promise.resolve({ data: { user: null }, error: null }),
          },
        } as any;
      });

      const proxy = await loadProxy();
      await proxy(createRequest('/'));

      expect(responseCookiesSet).toHaveBeenCalled();
      const lastCall = responseCookiesSet.mock.calls[responseCookiesSet.mock.calls.length - 1];
      expect(lastCall[2]).toMatchObject({
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
      });

      nextSpy.mockRestore();
    });
  });

  describe('ROUTE_AUTH_MATRIX.md documents the canonical matrix', () => {
    it('exists and covers page and API route rows', () => {
      const matrixPath = path.resolve(process.cwd(), 'docs', 'ROUTE_AUTH_MATRIX.md');
      const content = fs.readFileSync(matrixPath, 'utf-8');

      expect(content).toContain('Cookie session');
      expect(content).toContain('/api/seller/*');
      expect(content).toContain('/api/admin/*');
      expect(content).toContain('/seller/*');
      expect(content).toContain('/admin/*');
      expect(content).toContain('seller');
      expect(content).toContain('admin');
      expect(content).toContain('401');
      expect(content).toContain('403');
    });
  });
});
