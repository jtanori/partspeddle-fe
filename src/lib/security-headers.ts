function isProduction(): boolean {
  return process.env.NODE_ENV === 'production';
}

function buildContentSecurityPolicy(): string {
  return isProduction()
    ? [
        "default-src 'self'",
        "script-src 'self'",
        "style-src 'self'",
        "img-src 'self' data: blob: https://images.unsplash.com https://picsum.photos https://*.supabase.co",
        "font-src 'self'",
        "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://*.algolia.net https://*.algolianet.com",
        "frame-ancestors 'none'",
        "base-uri 'self'",
        "form-action 'self'",
      ].join('; ')
    : [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
        "style-src 'self' 'unsafe-inline'",
        "img-src 'self' data: blob: https://images.unsplash.com https://picsum.photos https://*.supabase.co",
        "font-src 'self'",
        "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://*.algolia.net https://*.algolianet.com",
        "frame-ancestors 'none'",
        "base-uri 'self'",
        "form-action 'self'",
      ].join('; ');
}

export const SECURITY_HEADERS = {
  'Content-Security-Policy': buildContentSecurityPolicy(),
  'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
} as const;

export type SecurityHeaderName = keyof typeof SECURITY_HEADERS;

export function securityHeaderEntries(): Array<{ key: SecurityHeaderName; value: string }> {
  const headers = {
    ...SECURITY_HEADERS,
    'Content-Security-Policy': buildContentSecurityPolicy(),
  };
  return (Object.entries(headers) as Array<[SecurityHeaderName, string]>).map(
    ([key, value]) => ({ key, value }),
  );
}
