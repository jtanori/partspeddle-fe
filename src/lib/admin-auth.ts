import { createServerClient } from '@supabase/ssr';
import { NextRequest } from 'next/server';
import { getUserRole, type UserRole } from './user-roles';

export interface AdminAuthResult {
  session: any;
  role: UserRole;
  isAdmin: boolean;
  response: { error: string; status: number } | null;
}

export async function requireAdmin(request: NextRequest): Promise<AdminAuthResult> {
  const supabase = createServerClient(
    process.env.SUPABASE_URL || '',
    process.env.SUPABASE_ANON_KEY || '',
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: () => {},
      },
    },
  );

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return {
      session: null,
      role: 'buyer',
      isAdmin: false,
      response: { error: 'Unauthorized', status: 401 },
    };
  }

  const role = await getUserRole(supabase, user.id);

  if (role !== 'admin') {
    return {
      session: null,
      role,
      isAdmin: false,
      response: { error: 'Forbidden', status: 403 },
    };
  }

  return { session: null, role, isAdmin: true, response: null };
}
