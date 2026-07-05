import { NextRequest, NextResponse } from 'next/server';
import { SearchIndexWorker } from '@/backend/modules/search/application/search-index-worker';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { requireAdmin } from '@/lib/admin-auth';

const searchIndexWorker = new SearchIndexWorker();

export async function POST(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (auth.response) {
    return NextResponse.json({ error: auth.response.error }, { status: auth.response.status });
  }

  try {
    // Reindex all parts (full rebuild)
    const { data: parts, error } = await supabaseAdmin.from('parts').select('id');
    if (error) throw error;

    // Batching for performance (e.g., chunks of 50)
    const partIds = parts?.map((p) => p.id) || [];
    const BATCH_SIZE = 50;
    for (let i = 0; i < partIds.length; i += BATCH_SIZE) {
      const batch = partIds.slice(i, i + BATCH_SIZE);
      await searchIndexWorker.processPartsUpdated(batch);
    }

    return NextResponse.json({
      message: `Successfully reindexed ${partIds.length} parts`,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Admin Reindex Error:', error);
    return NextResponse.json({ error: 'Failed to reindex', message }, { status: 500 });
  }
}
