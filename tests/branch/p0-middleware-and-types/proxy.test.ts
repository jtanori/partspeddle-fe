import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { NextRequest } from 'next/server';
import { getUserRole } from '@/lib/user-roles';

vi.mock('@/lib/observability', () => ({
  tracer: {
    startActiveSpan: vi.fn((_name: string, fn: (span: { end: () => void }) => unknown) =>
      fn({ end: vi.fn() })
    ),
  },
}));

const createServerClientMock = vi.fn();
vi.mock('@supabase/ssr', () => ({
  createServerClient: createServerClientMock,
}));

vi.mock('@/lib/user-roles', () => ({
  getUserRole: vi.fn(),
}));

const getUserRoleMock = vi.mocked(getUserRole);

async function loadProxy() {
  const mod = await import('../../../apps/web/src/proxy');
  return mod.proxy;
}

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
  });
  getUserRoleMock.mockResolvedValue(role as any);
}

describe('src/proxy (Next.js 16 proxy convention)', () => {
  beforeEach(() => {
    createServerClientMock.mockReset();
    getUserRoleMock.mockReset();
  });

  it('lets health checks pass through without a session', async () => {
    mockSession(null);
    const proxy = await loadProxy();
    const req = createRequest('/api/health');
    const res = await proxy(req);
    expect(res.status).toBe(200);
  });

  it('redirects unauthenticated users from /dashboard to /login', async () => {
    mockSession(null);
    const proxy = await loadProxy();
    const req = createRequest('/dashboard');
    const res = await proxy(req);
    expect(res.status).toBe(307);
    expect(res.headers.get('location')).toBe('http://localhost:3000/login');
  });

  it('redirects unauthenticated users from /seller to /login', async () => {
    mockSession(null);
    const proxy = await loadProxy();
    const req = createRequest('/seller');
    const res = await proxy(req);
    expect(res.status).toBe(307);
    expect(res.headers.get('location')).toBe('http://localhost:3000/login');
  });

  it('redirects unauthenticated users from /admin to /login', async () => {
    mockSession(null);
    const proxy = await loadProxy();
    const req = createRequest('/admin');
    const res = await proxy(req);
    expect(res.status).toBe(307);
    expect(res.headers.get('location')).toBe('http://localhost:3000/login');
  });

  it('redirects buyers away from /seller', async () => {
    mockSession('buyer');
    const proxy = await loadProxy();
    const req = createRequest('/seller/inventory');
    const res = await proxy(req);
    expect(res.status).toBe(307);
    expect(res.headers.get('location')).toBe('http://localhost:3000/dashboard');
  });

  it('redirects buyers away from /admin', async () => {
    mockSession('buyer');
    const proxy = await loadProxy();
    const req = createRequest('/admin');
    const res = await proxy(req);
    expect(res.status).toBe(307);
    expect(res.headers.get('location')).toBe('http://localhost:3000/dashboard');
  });

  it('allows sellers into /seller routes', async () => {
    mockSession('seller');
    const proxy = await loadProxy();
    const req = createRequest('/seller/inventory');
    const res = await proxy(req);
    expect(res.status).toBe(200);
  });

  it('allows admins into /admin routes', async () => {
    mockSession('admin');
    const proxy = await loadProxy();
    const req = createRequest('/admin');
    const res = await proxy(req);
    expect(res.status).toBe(200);
  });

  it('redirects authenticated users away from /login to their home route', async () => {
    mockSession('seller');
    const proxy = await loadProxy();
    const req = createRequest('/login');
    const res = await proxy(req);
    expect(res.status).toBe(307);
    expect(res.headers.get('location')).toBe('http://localhost:3000/seller');
  });

  it('lets public routes pass through without a session', async () => {
    mockSession(null);
    const proxy = await loadProxy();
    const req = createRequest('/');
    const res = await proxy(req);
    expect(res.status).toBe(200);
  });
});
