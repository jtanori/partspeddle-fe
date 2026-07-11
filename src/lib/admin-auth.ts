import { NextRequest } from 'next/server';
import { createAuthClient } from './supabase-server';
import { getUserRole, type UserRole } from './user-roles';

export interface AdminAuthResult {
  user: any;
  role: UserRole;
  isAdmin: boolean;
  response: { error: string; status: number } | null;
}

export async function requireAdmin(request: NextRequest): Promise<AdminAuthResult> {
  const supabase = createAuthClient(request);

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return {
      user: null,
      role: 'buyer',
      isAdmin: false,
      response: { error: 'Unauthorized', status: 401 },
    };
  }

  const role = await getUserRole(supabase, user.id);

  if (role !== 'admin') {
    return {
      user,
      role,
      isAdmin: false,
      response: { error: 'Forbidden', status: 403 },
    };
  }

  return { user, role, isAdmin: true, response: null };
}
