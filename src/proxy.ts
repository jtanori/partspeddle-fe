import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { tracer } from '@/lib/observability';
import { getUserRole, type UserRole } from '@/lib/user-roles';

export async function proxy(request: NextRequest) {
  const start = Date.now();
  if (request.nextUrl.pathname === '/') {
    console.log(`[PERF] Request started: ${request.nextUrl.pathname}`);
  }

  const responsePromise = tracer.startActiveSpan('proxy', async (span) => {
    let response = NextResponse.next({
      request: {
        headers: request.headers,
      },
    });

    const supabaseUrl = process.env.SUPABASE_URL || '';
    const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || '';

    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            response.cookies.set(name, value, options);
          });
        },
      },
    });

    const url = request.nextUrl.clone();
    const isHealthCheck = url.pathname === '/api/health';

    if (isHealthCheck) {
      span.end();
      return response;
    }

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    const isAuthenticated = !userError && !!user;

    const isProtectedRoute =
      url.pathname.startsWith('/dashboard') ||
      url.pathname.startsWith('/seller') ||
      url.pathname.startsWith('/admin');

    const isAuthPage =
      url.pathname.startsWith('/login') ||
      url.pathname.startsWith('/register') ||
      url.pathname === '/auth';

    // Protected routes require an authenticated user
    if (isProtectedRoute && !isAuthenticated) {
      url.pathname = '/login';
      span.end();
      return NextResponse.redirect(url);
    }

    if (isAuthenticated) {
      const role: UserRole = await getUserRole(supabase, user.id);

      if (url.pathname.startsWith('/seller') && role !== 'seller') {
        url.pathname = '/dashboard';
        span.end();
        return NextResponse.redirect(url);
      }

      if (url.pathname.startsWith('/admin') && role !== 'admin') {
        url.pathname = '/dashboard';
        span.end();
        return NextResponse.redirect(url);
      }

      // Redirect logged in users away from auth pages
      if (isAuthPage) {
        url.pathname = role === 'seller' ? '/seller' : '/dashboard';
        span.end();
        return NextResponse.redirect(url);
      }
    }

    span.end();
    return response;
  });

  const response = await responsePromise;

  if (request.nextUrl.pathname === '/') {
    console.log(
      `[PERF] Request finished: ${request.nextUrl.pathname} took ${Date.now() - start}ms`,
    );
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
