import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/request';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const url = req.nextUrl.clone();

  // Protected routes
  if (!session) {
    if (url.pathname.startsWith('/dashboard') || url.pathname.startsWith('/seller') || url.pathname.startsWith('/admin')) {
      url.pathname = '/login';
      return NextResponse.redirect(url);
    }
  } else {
    // Role based protection
    const role = session.user.user_metadata.role || 'buyer';

    if (url.pathname.startsWith('/seller') && role !== 'seller') {
      url.pathname = '/dashboard';
      return NextResponse.redirect(url);
    }

    if (url.pathname.startsWith('/admin') && role !== 'admin') {
      url.pathname = '/dashboard';
      return NextResponse.redirect(url);
    }

    // Redirect logged in users away from auth pages
    if (url.pathname.startsWith('/login') || url.pathname.startsWith('/register')) {
      url.pathname = role === 'seller' ? '/seller' : '/dashboard';
      return NextResponse.redirect(url);
    }
  }

  return res;
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/seller/:path*',
    '/admin/:path*',
    '/login',
    '/register',
  ],
};
