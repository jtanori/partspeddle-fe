function isProduction(): boolean {
  return process.env.NODE_ENV === 'production';
}

/**
 * Build a Content-Security-Policy string.
 *
 * When a nonce is provided, `script-src` is locked to that nonce and `'self'`.
 * This is the production-hardened policy and should be set per-request via
 * middleware so the nonce changes on every request.
 *
 * When no nonce is provided, a fallback policy is returned. In production the
 * fallback still allows inline scripts (legacy compatibility for static
 * generation contexts where no nonce is available). In development it also
 * allows `'unsafe-eval'` for hot-module replacement.
 */
export function buildContentSecurityPolicy(nonce?: string): string {
  const scriptSrc =
    nonce != null && nonce.length > 0
      ? `script-src 'self' 'nonce-${nonce}'`
      : isProduction()
        ? "script-src 'self' 'unsafe-inline'"
        : "script-src 'self' 'unsafe-inline' 'unsafe-eval'";

  return [
    "default-src 'self'",
    scriptSrc,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https://images.unsplash.com https://picsum.photos https://*.supabase.co",
    "font-src 'self'",
    "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://*.algolia.net https://*.algolianet.com",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join('; ');
}

/**
 * Non-CSP security headers that can be applied globally via next.config.ts.
 *
 * Content-Security-Policy is intentionally omitted here because it is
 * request-scoped and must carry a fresh nonce. It is set by middleware instead.
 */
export const STATIC_SECURITY_HEADERS = {
  'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
} as const;

export type StaticSecurityHeaderName = keyof typeof STATIC_SECURITY_HEADERS;

/**
 * @deprecated Use STATIC_SECURITY_HEADERS for next.config.ts and
 * buildContentSecurityPolicy(nonce) in middleware. Kept for compatibility with
 * existing callers that do not need CSP (e.g., non-HTML responses).
 */
export const SECURITY_HEADERS = {
  ...STATIC_SECURITY_HEADERS,
} as const;

export type SecurityHeaderName = keyof typeof SECURITY_HEADERS;

/**
 * Entries for non-CSP security headers.
 *
 * These are safe to return from `next.config.ts` because they do not contain a
 * nonce. The CSP header is added request-scoped by middleware.
 */
export function securityHeaderEntries(): Array<{ key: SecurityHeaderName; value: string }> {
  return (Object.entries(STATIC_SECURITY_HEADERS) as Array<[SecurityHeaderName, string]>).map(
    ([key, value]) => ({ key, value }),
  );
}
