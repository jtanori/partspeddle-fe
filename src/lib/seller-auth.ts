import { NextRequest, NextResponse } from 'next/server';
import type { User } from '@supabase/supabase-js';
import { createAuthClient } from '@/lib/supabase-server';
import { getUserRole } from '@/lib/user-roles';
import { supabaseAdmin } from '@/lib/supabase-admin';

type SellerAuthResult = { user: User; error: null } | { user: null; error: NextResponse };

/**
 * Require a browser cookie session belonging to a user whose canonical role is
 * `seller`. This is the default auth check for all browser-initiated `/api/seller/*`
 * routes and aligns them with the page-route session model in `src/proxy.ts`.
 */
export async function requireSeller(req: NextRequest): Promise<SellerAuthResult> {
  const supabase = createAuthClient(req);

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return {
      user: null,
      error: NextResponse.json({ error: 'Unauthorized session.' }, { status: 401 }),
    };
  }

  const role = await getUserRole(supabase, user.id);

  if (role !== 'seller') {
    return {
      user: null,
      error: NextResponse.json({ error: 'Forbidden: seller role required.' }, { status: 403 }),
    };
  }

  return { user, error: null };
}

/**
 * Require any authenticated browser cookie session. Useful as a lightweight
 * defense-in-depth check before role-specific logic.
 */
export async function requireAuthenticated(req: NextRequest): Promise<SellerAuthResult> {
  const supabase = createAuthClient(req);

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return {
      user: null,
      error: NextResponse.json({ error: 'Unauthorized session.' }, { status: 401 }),
    };
  }

  return { user, error: null };
}

/**
 * Require an explicit machine-to-machine Bearer token verified against the
 * service-role key. Reserve this for documented M2M integrations only; browser
 * routes should use `requireSeller`.
 */
export async function requireSellerMachine(req: NextRequest): Promise<SellerAuthResult> {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    return {
      user: null,
      error: NextResponse.json({ error: 'Missing authorization context.' }, { status: 401 }),
    };
  }

  const token = authHeader.replace('Bearer ', '');
  const {
    data: { user },
    error: authError,
  } = await supabaseAdmin.auth.getUser(token);

  if (authError || !user) {
    return {
      user: null,
      error: NextResponse.json({ error: 'Unauthorized session window.' }, { status: 401 }),
    };
  }

  return { user, error: null };
}
