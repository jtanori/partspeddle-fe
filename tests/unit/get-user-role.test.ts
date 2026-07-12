import { describe, it, expect, vi } from 'vitest';
import { getUserRole } from '../../apps/web/src/lib/user-roles';

function createMockClient(returnValue: { role: string } | null, error?: Error) {
  return {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ data: returnValue, error })),
        })),
      })),
    })),
  } as any;
}

describe('getUserRole', () => {
  it('returns the role from public.user_roles', async () => {
    const client = createMockClient({ role: 'seller' });
    const role = await getUserRole(client, 'user-1');
    expect(role).toBe('seller');
    expect(client.from).toHaveBeenCalledWith('user_roles');
  });

  it('defaults to buyer when no row exists', async () => {
    const client = createMockClient(null, { message: 'not found' } as any);
    const role = await getUserRole(client, 'user-1');
    expect(role).toBe('buyer');
  });

  it('coerces unknown roles to buyer', async () => {
    const client = createMockClient({ role: 'superuser' });
    const role = await getUserRole(client, 'user-1');
    expect(role).toBe('buyer');
  });
});
