import { createServerClient } from '@supabase/ssr';
import { NextRequest } from 'next/server';

/**
 * Create a server-side Supabase client bound to the request cookies.
 *
 * Use this in Route Handlers and Server Components that only need to read the
 * authenticated user or make user-scoped queries. The client does **not** write
 * cookies back to a response; use the inline `createServerClient` setup in
 * middleware (`src/proxy.ts`) when cookie refresh must be propagated.
 */
export function createAuthClient(request: NextRequest) {
  return createServerClient(process.env.SUPABASE_URL || '', process.env.SUPABASE_ANON_KEY || '', {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: () => {},
    },
  });
}

/**
 * Create an anonymous (anon-key) server client for public reads.
 *
 * Use this in public Server Components and public API routes where no
 * authenticated user is required. RLS policies enforce what data is visible.
 */
export function createAnonServerClient() {
  return createServerClient(process.env.SUPABASE_URL || '', process.env.SUPABASE_ANON_KEY || '', {
    cookies: {
      getAll: () => [],
      setAll: () => {},
    },
  });
}
