import { createBrowserClient } from '@supabase/ssr'

// Next.js variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key';

// Singleton instance to prevent "Multiple GoTrueClient instances" warnings
let browserClient: any;

function getSupabaseClient() {
  if (typeof window === 'undefined') {
    // For SSR/Server components, create a minimal client or a placeholder
    return createBrowserClient(supabaseUrl, supabaseAnonKey);
  }

  if (!browserClient) {
    browserClient = createBrowserClient(supabaseUrl, supabaseAnonKey);
  }
  return browserClient;
}

export const supabase = getSupabaseClient();
