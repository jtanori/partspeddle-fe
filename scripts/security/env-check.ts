import { env } from '@/lib/env';

function checkEnv(): boolean {
  const requiredServer = [
    'SUPABASE_URL',
    'SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
    'ALGOLIA_APP_ID',
    'ALGOLIA_ADMIN_KEY',
    'GEMINI_API_KEY',
  ];
  const requiredPublic = ['NEXT_PUBLIC_SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_ANON_KEY'];

  let ok = true;
  for (const key of requiredServer) {
    const value = (env.server as Record<string, string | undefined>)[key];
    if (!value) {
      console.error(`Missing server environment variable: ${key}`);
      ok = false;
    }
  }
  for (const key of requiredPublic) {
    const value = process.env[key];
    if (!value) {
      console.error(`Missing public environment variable: ${key}`);
      ok = false;
    }
  }

  return ok;
}

if (!checkEnv()) {
  process.exit(1);
}
console.log('Environment check passed.');
