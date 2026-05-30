import { seedDatabase } from './seed';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Setup environment for Node execution
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_AUTH_URL || '';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Supabase credentials missing in .env');
  process.exit(1);
}

// We don't override the import, we just run the seeder which uses the global supabase client.
// We need to ensure src/lib/supabase.ts can read these process.env variables.

async function run() {
  console.log('--- PartsPeddle Database Seeder ---');
  console.log('Target URL:', supabaseUrl);
  
  const result = await seedDatabase();
  if (result.success) {
    console.log('✅ Seeding successful');
    process.exit(0);
  } else {
    console.error('❌ Seeding failed');
    process.exit(1);
  }
}

run();
