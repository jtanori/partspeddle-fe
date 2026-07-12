import { algoliaClient, SEARCH_INDEX_NAME } from '../../apps/web/src/backend/modules/search/infrastructure/algolia-client';
import { supabaseAdmin } from '../../apps/web/src/lib/supabase-admin';
import { BuildSearchDocumentUseCase } from '../../apps/web/src/backend/modules/search/application/build-search-document';

async function reindexAll() {
  console.log('🔄 Starting full reindex...');
  const builder = new BuildSearchDocumentUseCase();

  const { data: parts, error } = await supabaseAdmin.from('parts').select('id').eq('status', 'AVAILABLE');
  if (error) throw error;

  const partIds = parts?.map(p => p.id) || [];
  const BATCH_SIZE = 50;
  
  for (let i = 0; i < partIds.length; i += BATCH_SIZE) {
    const batchIds = partIds.slice(i, i + BATCH_SIZE);
    const documents = await Promise.all(batchIds.map(id => builder.execute(id)));
    
    await algoliaClient.saveObjects({
      indexName: SEARCH_INDEX_NAME,
      objects: documents as unknown as Record<string, unknown>[],
    });
    console.log(`✅ Indexed ${i + batchIds.length}/${partIds.length} parts`);
  }
  console.log('🚀 Reindex complete.');
}

reindexAll();
