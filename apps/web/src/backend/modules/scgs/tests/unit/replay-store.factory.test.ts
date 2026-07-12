import { describe, it, expect } from 'vitest';
import { createReplayStore } from '../../infrastructure/replay/replay-store.factory';
import { FilesystemReplayStore } from '../../infrastructure/replay/filesystem-replay-store';
import { SupabaseReplayStore } from '../../infrastructure/replay/supabase-replay-store';

describe('createReplayStore', () => {
  it('returns a filesystem store by default', () => {
    const store = createReplayStore({});
    expect(store).toBeInstanceOf(FilesystemReplayStore);
  });

  it('returns a filesystem store when explicitly requested', () => {
    const store = createReplayStore({ SCGS_REPLAY_STORE: 'filesystem' });
    expect(store).toBeInstanceOf(FilesystemReplayStore);
  });

  it('falls back to filesystem when Supabase config is incomplete', () => {
    const store = createReplayStore({
      SCGS_REPLAY_STORE: 'supabase',
      SUPABASE_URL: 'https://example.supabase.co',
      // missing service role key and bucket
    });
    expect(store).toBeInstanceOf(FilesystemReplayStore);
  });

  it('returns a Supabase store when fully configured', () => {
    const store = createReplayStore({
      SCGS_REPLAY_STORE: 'supabase',
      SUPABASE_URL: 'https://example.supabase.co',
      SUPABASE_SERVICE_ROLE_KEY: 'test-key',
      SCGS_STORAGE_BUCKET: 'scgs-replay-traces',
      SCGS_STORAGE_PATH_PREFIX: 'ci',
    });
    expect(store).toBeInstanceOf(SupabaseReplayStore);
  });
});
