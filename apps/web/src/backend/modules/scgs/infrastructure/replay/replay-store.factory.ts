import type { ReplayStore } from '../../domain/replay/replay-store.port';
import { FilesystemReplayStore } from './filesystem-replay-store';
import { SupabaseReplayStore } from './supabase-replay-store';
import { supabaseAdmin } from '@/lib/supabase-admin';

export interface ReplayStoreFactoryEnv {
  SCGS_REPLAY_STORE?: 'filesystem' | 'supabase';
  SCGS_STORAGE_BUCKET?: string;
  SCGS_STORAGE_PATH_PREFIX?: string;
  SUPABASE_URL?: string;
  SUPABASE_SERVICE_ROLE_KEY?: string;
  NODE_ENV?: string;
}

export function createReplayStore(env: ReplayStoreFactoryEnv = process.env): ReplayStore {
  const storeType = env.SCGS_REPLAY_STORE;

  if (storeType === 'supabase') {
    const bucket = env.SCGS_STORAGE_BUCKET;
    const prefix = env.SCGS_STORAGE_PATH_PREFIX ?? 'scgs';
    const supabaseUrl = env.SUPABASE_URL;
    const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY;

    if (!bucket || !supabaseUrl || !serviceRoleKey) {
      console.warn(
        '[SCGS] Supabase replay store requested but missing bucket, URL, or service role key. Falling back to filesystem.',
      );
      return new FilesystemReplayStore();
    }

    return new SupabaseReplayStore({
      bucket,
      prefix,
      getSupabaseClient: () => supabaseAdmin,
    });
  }

  return new FilesystemReplayStore();
}
