import { Request, Response } from 'express';
import { SearchIndexWorker } from '../application/search-index-worker';
import { supabaseAdmin } from '@/lib/supabase-admin';

const searchIndexWorker = new SearchIndexWorker();

export const adminReindexHandler = async (req: Request, res: Response) => {
  try {
    const { partId } = req.params;

    if (partId) {
      // Reindex single part
      await searchIndexWorker.processPartUpdated(partId);
      return res.json({ message: `Successfully reindexed part ${partId}` });
    } else {
      // Reindex all parts (full rebuild)
      const { data: parts, error } = await supabaseAdmin.from('parts').select('id');
      if (error) throw error;

      // Batching for performance (e.g., chunks of 50)
      const partIds = parts?.map(p => p.id) || [];
      const BATCH_SIZE = 50;
      for (let i = 0; i < partIds.length; i += BATCH_SIZE) {
        const batch = partIds.slice(i, i + BATCH_SIZE);
        await searchIndexWorker.processPartsUpdated(batch);
      }
      
      return res.json({ message: `Successfully reindexed ${partIds.length} parts` });
    }
  } catch (error: any) {
    console.error("Admin Reindex Error:", error);
    res.status(500).json({ error: 'Failed to reindex' });
  }
};
