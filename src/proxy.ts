import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { tracer } from '@/lib/observability'

export async function proxy(request: NextRequest) {
  const start = Date.now();
  if (request.nextUrl.pathname === '/') {
    console.log(`[PERF] Request started: ${request.nextUrl.pathname}`);
  }

  const responsePromise = tracer.startActiveSpan('middleware-proxy', async (span) => {
    let response = NextResponse.next({
      request: {
        headers: request.headers,
      },
    })

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';
  
    const supabase = createServerClient(
      supabaseUrl,
      supabaseAnonKey,
      {
        cookies: {
          getAll: () => request.cookies.getAll(),
          setAll: (cookiesToSet) => {
            cookiesToSet.forEach(({ name, value, options }) => {
              request.cookies.set(name, value)
              response.cookies.set(name, value, options)
            })
          },
        },
      }
    )
  
    const url = request.nextUrl.clone()
    const isPublicRoute = url.pathname === '/' || url.pathname.startsWith('/search') || url.pathname.startsWith('/listing')
    const isHealthCheck = url.pathname === '/api/health'
    
    // Skip session check for health checks and non-protected public routes to save ~500ms
    if (isHealthCheck) {
      span.end()
      return response
    }
  
    // Refresh session if expired - required for Server Components
    // We only do this for protected routes or if we are not on a public route that we want to be ultra-fast
    let session = null
    if (!isPublicRoute || url.pathname.startsWith('/dashboard') || url.pathname.startsWith('/seller') || url.pathname.startsWith('/admin')) {
      const { data: { session: currentSession } } = await supabase.auth.getSession()
      session = currentSession
    }
  
    // Protected routes
    if (!session) {
      if (url.pathname.startsWith('/dashboard') || url.pathname.startsWith('/seller') || url.pathname.startsWith('/admin')) {
        url.pathname = '/login'
        span.end()
        return NextResponse.redirect(url)
      }
    } else {
      // Role based protection
      const role = session.user.user_metadata.role || 'buyer'
  
      if (url.pathname.startsWith('/seller') && role !== 'seller') {
        url.pathname = '/dashboard'
        span.end()
        return NextResponse.redirect(url)
      }
  
      if (url.pathname.startsWith('/admin') && role !== 'admin') {
        url.pathname = '/dashboard'
        span.end()
        return NextResponse.redirect(url)
      }
  
      // Redirect logged in users away from auth pages
      if (url.pathname.startsWith('/login') || url.pathname.startsWith('/register')) {
        url.pathname = role === 'seller' ? '/seller' : '/dashboard'
        span.end()
        return NextResponse.redirect(url)
      }
    }
  
    span.end()
    return response
  })

  const response = await responsePromise;
  
  if (request.nextUrl.pathname === '/') {
    console.log(`[PERF] Request finished: ${request.nextUrl.pathname} took ${Date.now() - start}ms`);
  }

  return response;
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/seller/:path*',
    '/admin/:path*',
    '/login',
    '/register',
  ],
}
