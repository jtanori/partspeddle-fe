// Canonical role lookup against public.user_roles (P1.1).
// All auth checks should use this instead of user_metadata.role.

import { SupabaseClient } from '@supabase/supabase-js';

export type UserRole = 'buyer' | 'seller' | 'admin';

export async function getUserRole(
  client: Pick<SupabaseClient, 'from'>,
  userId: string
): Promise<UserRole> {
  const { data, error } = await client
    .from('user_roles')
    .select('role')
    .eq('user_id', userId)
    .single();

  if (error || !data) {
    return 'buyer';
  }

  const role = data.role as UserRole;
  return role === 'seller' || role === 'admin' ? role : 'buyer';
}
