import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { buildContentSecurityPolicy } from '@/lib/security-headers';

/**
 * Generate a 16-byte cryptographically-secure nonce and return it as a
 * base64-encoded string.
 *
 * This runs in the Edge Runtime, so we use Web Crypto instead of Node's
 * `crypto` module and avoid `Buffer`.
 */
function generateNonce(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return btoa(String.fromCharCode(...bytes));
}

/**
 * Request-scoped Content-Security-Policy.
 *
 * A fresh nonce is generated for every request and applied to `script-src`.
 * Next.js App Router uses this nonce when emitting inline Flight bootstrap
 * scripts, allowing us to keep a strict CSP without `unsafe-inline`.
 */
// Next.js middleware receives the request as its first argument even when the
// CSP logic does not need to inspect it.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function middleware(request: NextRequest): NextResponse {
  const nonce = generateNonce();
  const csp = buildContentSecurityPolicy(nonce);

  const response = NextResponse.next();
  response.headers.set('Content-Security-Policy', csp);

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
};
