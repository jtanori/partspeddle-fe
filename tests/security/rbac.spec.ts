import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { NextRequest } from 'next/server';
import { getUserRole } from '@/lib/user-roles';

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

const createServerClientMock = vi.fn();
const getUserRoleMock = vi.mocked(getUserRole);

function createRequest(pathname: string): NextRequest {
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
      getAll: () => [],
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
          data: { user: role ? { id: 'user-1' } : null },
          error: null,
        }),
    },
  });
  getUserRoleMock.mockResolvedValue(role as any);
}

async function loadProxy() {
  const mod = await import('../../src/proxy');
  return mod.proxy;
}

describe('rbac', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    createServerClientMock.mockReset();
    getUserRoleMock.mockReset();
  });

  it('redirects anonymous users from /dashboard to /login', async () => {
    mockSession(null);
    const proxy = await loadProxy();
    const res = await proxy(createRequest('/dashboard'));
    expect(res.status).toBe(307);
    expect(res.headers.get('location')).toBe('http://localhost:3000/login');
  });

  it('redirects buyers away from /seller', async () => {
    mockSession('buyer');
    const proxy = await loadProxy();
    const res = await proxy(createRequest('/seller/inventory'));
    expect(res.status).toBe(307);
    expect(res.headers.get('location')).toBe('http://localhost:3000/dashboard');
  });

  it('redirects non-admins away from /admin', async () => {
    mockSession('seller');
    const proxy = await loadProxy();
    const res = await proxy(createRequest('/admin'));
    expect(res.status).toBe(307);
    expect(res.headers.get('location')).toBe('http://localhost:3000/dashboard');
  });
});
